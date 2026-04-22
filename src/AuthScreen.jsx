import React, { useState } from "react";
import { sendMagicLink } from "./supabase.js";

export default function AuthScreen() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | sending | sent | error
  const [errorMessage, setErrorMessage] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed) return;
    setStatus("sending");
    setErrorMessage("");
    try {
      await sendMagicLink(trimmed);
      setStatus("sent");
    } catch (err) {
      setErrorMessage(err?.message || "something went wrong — try again?");
      setStatus("error");
    }
  };

  return (
    <div
      className="min-h-screen w-full flex items-center justify-center px-6"
      style={{
        background: "linear-gradient(160deg, #f7d6ff 0%, #c5b3ff 25%, #ffb4de 55%, #a7e6ff 100%)",
        fontFamily: "'Space Grotesk', sans-serif",
      }}
    >
      <div
        className="w-full max-w-sm rounded-3xl p-8"
        style={{
          background: "linear-gradient(160deg, rgba(255,255,255,0.7) 0%, rgba(255,255,255,0.55) 100%)",
          border: "1px solid rgba(255,255,255,0.6)",
          boxShadow: "0 20px 60px rgba(255,110,199,0.35)",
          backdropFilter: "blur(20px)",
        }}
      >
        <div className="text-center mb-6">
          <h1
            className="text-5xl font-bold tracking-tight"
            style={{
              fontFamily: "'Pacifico', cursive",
              lineHeight: 1,
              background: "linear-gradient(110deg, #ff6ec7 0%, #ff8fc4 10%, #d49bff 22%, #a78bfa 34%, #8fa5ff 42%, #60e5ff 50%, #8fa5ff 58%, #a78bfa 66%, #d49bff 78%, #ff8fc4 90%, #ff6ec7 100%)",
              WebkitBackgroundClip: "text",
              backgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            daydream
          </h1>
          <p
            className="text-xs mt-2 italic"
            style={{ color: "#6b4aa8", fontFamily: "'Caveat', cursive", fontSize: "17px" }}
          >
            Romanticize life with radical whimsy
          </p>
        </div>

        {status === "sent" ? (
          <div className="text-center space-y-3 py-4">
            <p
              style={{
                color: "#3d1d6b",
                fontFamily: "'VT323', monospace",
                fontSize: "15px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              ✦ check your email ✦
            </p>
            <p className="italic" style={{ color: "#5b3a8a", fontFamily: "'Caveat', cursive", fontSize: "18px" }}>
              a magic link is on its way to
            </p>
            <p style={{ color: "#3d1d6b", fontSize: "14px", wordBreak: "break-all" }}>{email}</p>
            <button
              onClick={() => {
                setStatus("idle");
                setEmail("");
              }}
              className="mt-4 text-xs underline"
              style={{ color: "#6b4aa8" }}
            >
              use a different email
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p
              className="text-center mb-1"
              style={{
                color: "#6b4aa8",
                fontFamily: "'VT323', monospace",
                fontSize: "13px",
                letterSpacing: "0.15em",
                textTransform: "uppercase",
              }}
            >
              ▸ sign in / sign up
            </p>
            <input
              type="email"
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full p-3 rounded-xl outline-none"
              style={{
                color: "#2d1b4e",
                background: "rgba(255,255,255,0.75)",
                border: "1px solid rgba(167,139,250,0.45)",
                fontSize: 16,
              }}
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="w-full py-3 rounded-xl text-white iridescent disabled:opacity-50"
              style={{ boxShadow: "0 4px 20px rgba(255,110,199,0.5)" }}
            >
              {status === "sending" ? "sending..." : "send me a magic link ✦"}
            </button>
            {status === "error" && (
              <p className="text-xs text-center italic" style={{ color: "#c0306d" }}>
                {errorMessage}
              </p>
            )}
            <p
              className="text-center text-xs italic pt-2"
              style={{ color: "#7a5aa8", fontFamily: "'Caveat', cursive", fontSize: "15px" }}
            >
              we'll email you a link — no password needed
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
