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
  // Track the current user id so we can tell "real" session changes (user
  // changed, sign-in, sign-out) from silent token refreshes (same user).
  const userIdRef = useRef(null);

  useEffect(() => {
    let mounted = true;

    const applySession = (s, reason) => {
      if (!mounted) return;
      const newUserId = s?.user?.id ?? null;
      const prevUserId = userIdRef.current;

      // Silent token refresh: same user, same mounted component — keep
      // React state untouched so the tree doesn't re-render just because
      // the access_token string changed. The Supabase client already
      // stores the new token internally, so subsequent queries use it.
      if (reason === "TOKEN_REFRESHED" && newUserId && newUserId === prevUserId) {
        return;
      }

      userIdRef.current = newUserId;
      setSession(s);
    };

    supabase.auth.getSession().then(({ data }) => {
      applySession(data.session, "INITIAL");
      if (mounted) setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((event, s) => {
      applySession(s, event);
    });

    // Proactively refresh the session when the tab becomes visible or the
    // window regains focus. Catches cases where the laptop slept through
    // the auto-refresh timer, or the user left the PWA open for hours.
    const refresh = () => {
      supabase.auth.refreshSession().catch(() => {});
    };
    const onVisibility = () => {
      if (document.visibilityState === "visible") refresh();
    };
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
