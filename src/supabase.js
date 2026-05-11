import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(url, key, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: typeof window !== "undefined" ? window.localStorage : undefined,
    storageKey: "daydream.auth",
    flowType: "pkce",
  },
});

// ------------------------------------------------------------
// 401 / JWT-expired retry wrapper
//
// Supabase's client auto-refreshes tokens on a timer, but if a request
// slips through with a stale token (e.g. tab was backgrounded past the
// refresh window), the request can 401. Catch that, force a refresh,
// and try once more before giving up.
// ------------------------------------------------------------
function isAuthError(err) {
  if (!err) return false;
  const status = err.status ?? err.statusCode ?? err.code;
  const msg = String(err.message || err.error_description || "").toLowerCase();
  return (
    status === 401 ||
    status === "401" ||
    status === "PGRST301" ||
    msg.includes("jwt expired") ||
    msg.includes("invalid jwt") ||
    msg.includes("token is expired") ||
    msg.includes("not authenticated")
  );
}

async function withAuthRetry(fn) {
  try {
    return await fn();
  } catch (err) {
    if (!isAuthError(err)) throw err;
    const { data, error: refreshError } = await supabase.auth.refreshSession();
    if (refreshError || !data?.session) throw err;
    return await fn();
  }
}

// ------------------------------------------------------------
// Entry ↔ Row mapping
//
// DB columns: id, user_id, type, date, time, caption, mood, title, cover_photo, data (jsonb)
// Anything not in the top-level column set goes into `data`.
// ------------------------------------------------------------
const TOP_COLUMNS = new Set(["id", "type", "date", "time", "caption", "mood", "title"]);

export function entryToRow(entry, userId) {
  const row = {
    id: entry.id,
    user_id: userId,
    type: entry.type,
    date: entry.date ?? null,
    time: entry.time ?? null,
    caption: entry.caption ?? null,
    mood: entry.mood ?? null,
    title: entry.title ?? null,
    cover_photo: entry.coverPhoto ?? null,
    data: {},
  };
  for (const [k, v] of Object.entries(entry)) {
    if (TOP_COLUMNS.has(k) || k === "coverPhoto") continue;
    row.data[k] = v;
  }
  return row;
}

export function rowToEntry(row) {
  const entry = {
    id: row.id,
    type: row.type,
    date: row.date ?? undefined,
    time: row.time ?? undefined,
    ...(row.data || {}),
  };
  if (row.caption != null) entry.caption = row.caption;
  if (row.mood != null) entry.mood = row.mood;
  if (row.title != null) entry.title = row.title;
  if (row.cover_photo != null) entry.coverPhoto = row.cover_photo;
  return entry;
}

// ------------------------------------------------------------
// CRUD (all go through withAuthRetry)
// ------------------------------------------------------------
export async function fetchEntries(userId) {
  return withAuthRetry(async () => {
    const { data, error } = await supabase
      .from("entries")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data || []).map(rowToEntry);
  });
}

export async function upsertEntry(entry, userId) {
  return withAuthRetry(async () => {
    const row = entryToRow(entry, userId);
    const { error } = await supabase.from("entries").upsert(row, { onConflict: "id" });
    if (error) throw error;
  });
}

export async function deleteEntryById(id) {
  return withAuthRetry(async () => {
    const { error } = await supabase.from("entries").delete().eq("id", id);
    if (error) throw error;
  });
}

// ------------------------------------------------------------
// Photo storage
// ------------------------------------------------------------
const BUCKET = "photos";

function extFor(file) {
  const name = file.name || "";
  const dot = name.lastIndexOf(".");
  if (dot >= 0 && dot < name.length - 1) return name.slice(dot + 1).toLowerCase();
  const type = file.type || "";
  if (type.startsWith("image/")) return type.slice(6);
  return "png";
}

function randomId() {
  return (crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now());
}

export async function uploadPhoto(file) {
  return withAuthRetry(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error("not signed in");
    const path = `${userId}/${randomId()}.${extFor(file)}`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type || undefined,
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  });
}

export async function uploadCollageSnapshot(dataUrl, entryId) {
  return withAuthRetry(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const userId = session?.user?.id;
    if (!userId) throw new Error("not signed in");
    const res = await fetch(dataUrl);
    const blob = await res.blob();
    const path = `${userId}/collage-snapshots/${entryId}.jpg`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, blob, {
      cacheControl: "3600",
      upsert: true,
      contentType: "image/jpeg",
    });
    if (error) throw error;
    const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
    return data.publicUrl;
  });
}

// ------------------------------------------------------------
// Auth helpers
// ------------------------------------------------------------
export async function signInWithPassword(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signUpWithPassword(email, password) {
  const { data, error } = await supabase.auth.signUp({ email, password });
  if (error) throw error;
  // If email confirmation is enabled in the Supabase project, session will be null
  // until the user confirms. Surface that to the caller so we can show a helpful message.
  return data;
}

export async function signOut() {
  await supabase.auth.signOut();
}

export async function refreshSession() {
  try {
    const { data, error } = await supabase.auth.refreshSession();
    if (error) return null;
    return data.session;
  } catch {
    return null;
  }
}
