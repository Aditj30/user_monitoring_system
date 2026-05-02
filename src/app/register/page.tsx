"use client";
import React, { useState } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { Footer } from "@/components/Footer";

export default function RegisterPage() {
  const [name, setName]       = useState("");
  const [email, setEmail]     = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]     = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleRegister() {
    setError(""); setSuccess("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess("Registration successful! Redirecting to login...");
        setTimeout(() => window.location.href = "/login", 1500);
      } else {
        setError(data.error);
      }
    } catch {
      setError("Could not connect to server. Make sure Flask is running.");
    }
    setLoading(false);
  }

  return (
    <div className="relative min-h-screen bg-surface font-body text-on-surface">
      <TopNavBar />

      <main className="flex items-center justify-center min-h-[calc(100vh-80px)] px-4 py-12 relative overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]"></div>

        <div className="w-full max-w-md relative z-10">

          {error && (
            <div className="mb-6">
              <div className="bg-red-100 border-l-4 border-red-500 p-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-red-500">error</span>
                <p className="text-sm font-medium text-red-700">{error}</p>
              </div>
            </div>
          )}

          {success && (
            <div className="mb-6">
              <div className="bg-green-100 border-l-4 border-green-500 p-4 rounded-lg flex items-center gap-3">
                <span className="material-symbols-outlined text-green-500">check_circle</span>
                <p className="text-sm font-medium text-green-700">{success}</p>
              </div>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-[20px] rounded-xl shadow-2xl p-8 md:p-10">
            <header className="mb-10">
              <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-2">
                Create Account
              </h1>
              <p className="text-on-surface-variant font-body">
                Join IdentityPro and secure your digital identity.
              </p>
            </header>

            <div className="space-y-6">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Full Name
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    person
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline/50 border-b-2 border-transparent focus:border-primary"
                    placeholder="John Doe"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Email Address
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    alternate_email
                  </span>
                  <input
                    className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline/50 border-b-2 border-transparent focus:border-primary"
                    placeholder="john@example.com"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                  Password
                </label>
                <div className="relative group">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                    lock
                  </span>
                  <input
                    className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline/50 border-b-2 border-transparent focus:border-primary"
                    placeholder="Min 8 chars, 1 uppercase, 1 digit"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleRegister()}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface transition-colors"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <span className="material-symbols-outlined">
                      {showPassword ? "visibility_off" : "visibility"}
                    </span>
                  </button>
                </div>
                <p className="text-xs text-on-surface-variant ml-1">
                  Must be 8+ characters with at least 1 uppercase letter and 1 number
                </p>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleRegister}
                  disabled={loading}
                  className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25 flex justify-center items-center gap-2 disabled:opacity-60"
                >
                  {loading ? "Creating account..." : "Create Account"}
                  {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                </button>
              </div>
            </div>

            <footer className="mt-8 text-center">
              <p className="text-sm text-on-surface-variant">
                Already have an account?{" "}
                <a className="text-primary font-bold hover:underline" href="/login">
                  Sign in
                </a>
              </p>
            </footer>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}