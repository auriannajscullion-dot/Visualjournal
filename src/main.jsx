import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import App from "../daydream (1).jsx";
import AuthScreen from "./AuthScreen.jsx";
import { supabase } from "./supabase.js";
import { registerSW } from "virtual:pwa-register";

registerSW({ immediate: true });

function Root() {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
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
