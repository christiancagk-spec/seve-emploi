"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, AlertCircle } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail]             = useState("");
  const [password, setPassword]       = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]             = useState("");
  const [loading, setLoading]         = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        setError(result.error === "CredentialsSignin" ? "Identifiants incorrects" : result.error);
        setPassword("");
      } else {
        router.push("/dashboard");
        router.refresh();
      }
    } catch {
      setError("Impossible de joindre le serveur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 overflow-hidden relative"
         style={{ backgroundColor: "#0D3321" }}>

      {/* Blobs de fond */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute rounded-full opacity-20"
             style={{ width: 500, height: 500, top: -150, right: -80,
               background: "radial-gradient(circle, #1E7A45 0%, transparent 70%)", filter: "blur(70px)" }} />
        <div className="absolute rounded-full opacity-10"
             style={{ width: 350, height: 350, bottom: -80, left: -60,
               background: "radial-gradient(circle, #D97706 0%, transparent 70%)", filter: "blur(70px)" }} />
      </div>

      {/* Grille décorative */}
      <div className="pointer-events-none absolute inset-0"
           style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
             backgroundSize: "40px 40px" }} />

      {/* Card */}
      <div className="relative z-10 w-full max-w-[400px]"
           style={{ animation: "fadeUp 0.45s ease both" }}>
        <div className="rounded-2xl px-9 py-10"
             style={{ background: "rgba(250,250,247,0.97)",
               boxShadow: "0 25px 60px rgba(0,0,0,0.35), 0 0 0 1px rgba(255,255,255,0.08)" }}>

          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl mb-4"
                 style={{ background: "#0D3321" }}>
              <svg width="28" height="28" viewBox="0 0 30 30" fill="none">
                <path d="M15 4C15 4 6 9 6 17C6 22.5 10 26 15 26C20 26 24 22.5 24 17C24 9 15 4 15 4Z" fill="#1E7A45"/>
                <path d="M15 26L15 14" stroke="#E6F4EC" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15 18L19 14" stroke="#E6F4EC" strokeWidth="1.5" strokeLinecap="round"/>
                <path d="M15 21L11 17" stroke="#E6F4EC" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <h1 className="text-2xl font-bold leading-tight" style={{ fontFamily: "var(--font-syne), sans-serif", color: "#0D3321", letterSpacing: "-0.03em" }}>
              Prospection SEVE
            </h1>
            <p className="mt-1 text-xs font-semibold uppercase tracking-widest" style={{ color: "#5A7065" }}>
              An Grèn Koulèr
            </p>
          </div>

          <div style={{ height: 1, background: "#E4EDE7", marginBottom: "1.75rem" }} />

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="label">Adresse e-mail</label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                className="input"
                placeholder="votre@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label htmlFor="password" className="label">Mot de passe</label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  className="input pr-10"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center transition-colors"
                  style={{ color: "#9CAF9E" }}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg p-3 text-sm"
                   style={{ background: "#FEF2F2", border: "1.5px solid #FECACA", color: "#991B1B" }}>
                <AlertCircle className="h-4 w-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center mt-2"
              style={{ padding: "11px 16px" }}
            >
              {loading && (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full mr-2"
                      style={{ animation: "spin 0.6s linear infinite", display: "inline-block" }} />
              )}
              {loading ? "Connexion…" : "Se connecter"}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-xs" style={{ color: "rgba(255,255,255,0.28)", letterSpacing: "0.05em" }}>
          An Grèn Koulèr — Médiation Active · La Réunion &copy; 2026
        </p>
      </div>

      <style jsx global>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(18px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
