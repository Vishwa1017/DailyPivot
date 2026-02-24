"use client";

import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "signup">("login");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [infoMsg, setInfoMsg] = useState<string>("");
  const [showPassword, setShowPassword] = useState(false);

  const canSubmit = useMemo(() => {
    return email.trim().length > 3 && password.length >= 6 && !loading;
  }, [email, password, loading]);

  const resetMessages = () => {
    setErrorMsg("");
    setInfoMsg("");
  };

  const handleAuth = async () => {
    resetMessages();

    if (!email.trim() || !password) {
      setErrorMsg("Please enter email and password.");
      return;
    }
    if (password.length < 6) {
      setErrorMsg("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);

    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) {
          setErrorMsg(error.message);
        } else {
          setInfoMsg(
            "Signup successful. Check your email to confirm, then login.",
          );
          setMode("login");
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (error) {
          setErrorMsg(error.message);
        } else {
          router.push("/app");
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      {/* background glow */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-40 left-1/2 h-96 w-[42rem] -translate-x-1/2 rounded-full bg-blue-600/15 blur-3xl" />
        <div className="absolute top-40 right-[-10rem] h-80 w-80 rounded-full bg-violet-500/10 blur-3xl" />
        <div className="absolute bottom-[-12rem] left-[-12rem] h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto flex min-h-screen max-w-md items-center px-4">
        <div className="w-full rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 rounded-full border border-zinc-800 bg-zinc-950/40 px-3 py-1 text-xs text-zinc-300">
              <span className="h-2 w-2 rounded-full bg-emerald-400/80" />
              Daily Pivot
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {mode === "login" ? "Welcome back" : "Create your account"}
            </h1>
            <p className="text-sm text-zinc-400">
              {mode === "login"
                ? "Login to write today’s entry."
                : "Sign up to start tracking daily."}
            </p>
          </div>

          <div className="mt-6 space-y-4">
            {errorMsg ? (
              <div className="rounded-xl border border-rose-900/50 bg-rose-950/35 px-4 py-3 text-sm text-rose-200">
                {errorMsg}
              </div>
            ) : null}

            {infoMsg ? (
              <div className="rounded-xl border border-emerald-900/50 bg-emerald-950/35 px-4 py-3 text-sm text-emerald-200">
                {infoMsg}
              </div>
            ) : null}

            <label className="block">
              <div className="text-xs text-zinc-500 mb-2">Email</div>
              <input
                type="email"
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onFocus={resetMessages}
                placeholder="Email address"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition"
              />
            </label>

            <label className="block">
              <div className="flex items-center justify-between mb-2">
                <div className="text-xs text-zinc-500">Password</div>
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="text-xs text-zinc-400 hover:text-zinc-200 transition">
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>

              <input
                type={showPassword ? "text" : "password"}
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={resetMessages}
                placeholder="••••••••"
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3.5 py-2.5 text-sm text-zinc-100 placeholder:text-zinc-600 outline-none focus:border-zinc-600 transition"
                onKeyDown={(e) => {
                  if (e.key === "Enter") handleAuth();
                }}
              />
              <div className="mt-2 text-xs text-zinc-600">
                Minimum 6 characters.
              </div>
            </label>

            <button
              onClick={handleAuth}
              disabled={!canSubmit}
              className={[
                "w-full rounded-xl px-4 py-3 text-sm font-medium transition",
                "shadow-[0_1px_0_rgba(255,255,255,0.06)_inset]",
                canSubmit
                  ? "bg-gradient-to-b from-blue-500 to-blue-600 hover:from-blue-400 hover:to-blue-600 text-white border border-blue-400/30"
                  : "bg-zinc-800 text-zinc-500 cursor-not-allowed border border-zinc-800",
              ].join(" ")}>
              {loading
                ? mode === "login"
                  ? "Logging in…"
                  : "Creating account…"
                : mode === "login"
                  ? "Login"
                  : "Sign up"}
            </button>

            <div className="flex items-center justify-between pt-2">
              <div className="text-xs text-zinc-500">
                {mode === "login"
                  ? "No account yet?"
                  : "Already have an account?"}
              </div>
              <button
                type="button"
                onClick={() => {
                  resetMessages();
                  setMode((m) => (m === "login" ? "signup" : "login"));
                }}
                className="text-xs text-zinc-200 hover:text-white transition">
                {mode === "login" ? "Sign up" : "Login"}
              </button>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-zinc-600">
            Built with Next.js + Supabase • Portfolio MVP
          </div>
        </div>
      </div>
    </div>
  );
}