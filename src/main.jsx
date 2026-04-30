import React, { useEffect, useRef, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "../daydream (1).jsx";
import AuthScreen from "./AuthScreen.jsx";
import { supabase } from "./supabase.js";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const userIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    // Guard so loading is only cleared once — whichever signal fires first wins.
    let loadingDone = false;
    const clearLoading = () => {
      if (mounted && !loadingDone) { loadingDone = true; setLoading(false); }
    };

    const applySession = (s, event) => {
      if (!mounted) return;
      const newId = s?.user?.id ?? null;
      const prevId = userIdRef.current;
      // Silent token refresh for the same user: don't update React state at all.
      // The Supabase client already stored the new token internally.
      if (event === "TOKEN_REFRESHED" && newId && newId === prevId) return;
      userIdRef.current = newId;
      setSession(s);
    };

    // Subscribe first. In Supabase v2, INITIAL_SESSION fires synchronously with
    // the stored session as part of subscription — before any network round-trip.
    // This is the primary signal we use to decide when to stop showing the splash.
    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      if (event === "INITIAL_SESSION") {
        // INITIAL_SESSION = we now know the current auth state definitively.
        applySession(s, event);
        clearLoading();
        return;
      }
      applySession(s, event);
      // If INITIAL_SESSION never fired (edge case), any subsequent event also
      // means we have a definitive auth state — clear loading then too.
      clearLoading();
    });

    // Fallback: if onAuthStateChange never fires (shouldn't happen) clear loading
    // after getSession() resolves so the user isn't stuck on the splash forever.
    supabase.auth.getSession().then(({ data }) => {
      if (mounted && !loadingDone) {
        userIdRef.current = data.session?.user?.id ?? null;
        setSession(data.session);
        clearLoading();
      }
    });

    const refresh = () => supabase.auth.refreshSession().catch(() => {});
    const onVisibility = () => { if (document.visibilityState === "visible") refresh(); };
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("focus", refresh);

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("focus", refresh);
    };
  }, []);

  if (loading) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(160deg, #f7d6ff 0%, #c5b3ff 25%, #ffb4de 55%, #a7e6ff 100%)",
          color: "#6b4aa8",
          fontFamily: "'Caveat', cursive",
          fontSize: 24,
          fontStyle: "italic",
        }}
      >
        ✦ loading ✦
      </div>
    );
  }

  if (!session) return <AuthScreen />;
  return <App session={session} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Root />
  </React.StrictMode>
);
