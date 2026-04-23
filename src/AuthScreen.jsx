import React, { useState } from "react";
import { signInWithPassword, signUpWithPassword } from "./supabase.js";

export default function AuthScreen() {
  const [mode, setMode] = useState("signin"); // "signin" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [status, setStatus] = useState("idle"); // idle | submitting | error | pending-confirm
  const [errorMessage, setErrorMessage] = useState("");

  const isSignUp = mode === "signup";

  const submit = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setErrorMessage("enter your email");
      setStatus("error");
      return;
    }
    if (!password) {
      setErrorMessage("enter your password");
      setStatus("error");
      return;
    }
    if (isSignUp) {
      if (password.length < 6) {
        setErrorMessage("password must be at least 6 characters");
        setStatus("error");
        return;
      }
      if (password !== confirmPassword) {
        setErrorMessage("passwords don't match");
        setStatus("error");
        return;
      }
    }

    setStatus("submitting");
    try {
      if (isSignUp) {
        const data = await signUpWithPassword(trimmedEmail, password);
        // If Supabase is set to require email confirmation, session will be null.
        if (!data?.session) {
          setStatus("pending-confirm");
          return;
        }
        // Auth state listener in main.jsx will pick up the SIGNED_IN event.
      } else {
        await signInWithPassword(trimmedEmail, password);
      }
    } catch (err) {
      setErrorMessage(err?.message || "something went wrong — try again?");
      setStatus("error");
    }
  };

  const switchMode = (next) => {
    setMode(next);
    setStatus("idle");
    setErrorMessage("");
    setPassword("");
    setConfirmPassword("");
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
              background:
                "linear-gradient(110deg, #ff6ec7 0%, #ff8fc4 10%, #d49bff 22%, #a78bfa 34%, #8fa5ff 42%, #60e5ff 50%, #8fa5ff 58%, #a78bfa 66%, #d49bff 78%, #ff8fc4 90%, #ff6ec7 100%)",
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

        {status === "pending-confirm" ? (
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
            <p
              className="italic"
              style={{ color: "#5b3a8a", fontFamily: "'Caveat', cursive", fontSize: "18px" }}
            >
              confirm your address to finish signing up
            </p>
            <p style={{ color: "#3d1d6b", fontSize: "14px", wordBreak: "break-all" }}>{email}</p>
            <button
              onClick={() => switchMode("signin")}
              className="mt-4 text-xs underline"
              style={{ color: "#6b4aa8" }}
            >
              back to sign in
            </button>
          </div>
        ) : (
          <>
            {/* Mode toggle */}
            <div
              className="flex mb-4 p-1 rounded-full"
              style={{ background: "rgba(255,255,255,0.45)", border: "1px solid rgba(167,139,250,0.35)" }}
            >
              {[
                { id: "signin", label: "sign in" },
                { id: "signup", label: "sign up" },
              ].map((opt) => {
                const active = mode === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => switchMode(opt.id)}
                    className="flex-1 py-2 rounded-full transition"
                    style={{
                      background: active
                        ? "linear-gradient(110deg, rgba(255,110,199,0.55), rgba(96,229,255,0.5))"
                        : "transparent",
                      color: active ? "#2d1b4e" : "#6b4aa8",
                      fontWeight: active ? 600 : 500,
                      fontSize: 13,
                      boxShadow: active ? "0 2px 8px rgba(255,110,199,0.3)" : "none",
                    }}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>

            <form onSubmit={submit} className="space-y-3">
              <input
                type="email"
                required
                autoFocus
                autoComplete="email"
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
              <input
                type="password"
                required
                autoComplete={isSignUp ? "new-password" : "current-password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="password"
                className="w-full p-3 rounded-xl outline-none"
                style={{
                  color: "#2d1b4e",
                  background: "rgba(255,255,255,0.75)",
                  border: "1px solid rgba(167,139,250,0.45)",
                  fontSize: 16,
                }}
              />
              {isSignUp && (
                <input
                  type="password"
                  required
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="confirm password"
                  className="w-full p-3 rounded-xl outline-none"
                  style={{
                    color: "#2d1b4e",
                    background: "rgba(255,255,255,0.75)",
                    border: "1px solid rgba(167,139,250,0.45)",
                    fontSize: 16,
                  }}
                />
              )}
              <button
                type="submit"
                disabled={status === "submitting"}
                className="w-full py-3 rounded-xl text-white iridescent disabled:opacity-50"
                style={{ boxShadow: "0 4px 20px rgba(255,110,199,0.5)" }}
              >
                {status === "submitting" ? "..." : isSignUp ? "create account ✦" : "sign in ✦"}
              </button>
              {status === "error" && errorMessage && (
                <p className="text-xs text-center italic" style={{ color: "#c0306d" }}>
                  {errorMessage}
                </p>
              )}
            </form>
          </>
        )}
      </div>
    </div>
  );
}
