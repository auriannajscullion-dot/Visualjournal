import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !key) {
  throw new Error("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local");
}

export const supabase = createClient(url, key, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
});

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
// CRUD
// ------------------------------------------------------------
export async function fetchEntries(userId) {
  const { data, error } = await supabase
    .from("entries")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data || []).map(rowToEntry);
}

export async function upsertEntry(entry, userId) {
  const row = entryToRow(entry, userId);
  const { error } = await supabase.from("entries").upsert(row, { onConflict: "id" });
  if (error) throw error;
}

export async function deleteEntryById(id) {
  const { error } = await supabase.from("entries").delete().eq("id", id);
  if (error) throw error;
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
}

// ------------------------------------------------------------
// Auth helpers
// ------------------------------------------------------------
export async function sendMagicLink(email) {
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.origin },
  });
  if (error) throw error;
}

export async function signOut() {
  await supabase.auth.signOut();
}
