"use client";
import React, { useState } from "react";
import { TopNavBar } from "@/components/TopNavBar";
import { Footer } from "@/components/Footer";

export default function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);

  // OTP stage
  const [otpStage, setOtpStage]   = useState(false);
  const [otpCode, setOtpCode]     = useState("");
  const [otpDisplay, setOtpDisplay] = useState("");
  const [userId, setUserId]       = useState<number | null>(null);
  const [suspicious, setSuspicious] = useState(false);

  function startCountdown(seconds: number) {
  let remaining = seconds;
  const interval = setInterval(() => {
    remaining -= 1;
    setCooldown(remaining);
    if (remaining <= 0) {
      clearInterval(interval);
      setCooldown(0);
      setError("");
    }
  }, 1000);
}

  async function handleLogin() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        // Extract user_id from redirect URL e.g. /otp?user_id=5
        const uid = parseInt(data.redirect.split("user_id=")[1]);
        setUserId(uid);
        setSuspicious(data.suspicious);

        // Generate OTP
        const otpRes = await fetch("http://localhost:5000/api/generate-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ user_id: uid }),
        });
        const otpData = await otpRes.json();
        if (otpRes.ok) {
          setOtpDisplay(otpData.otp);
          setOtpStage(true);
        } else {
          setError(otpData.error);
        }
      } else {
        if (res.status === 429) {
          const match = data.error.match(/(\d+) seconds/);
          if (match) {
            const secs = parseInt(match[1]);
            setCooldown(secs);
            startCountdown(secs);
          }
        }
        setError(data.error);
      }
    } catch {
      setError("Could not connect to server. Make sure Flask is running.");
    }
    setLoading(false);
  }

  async function handleVerifyOTP() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ user_id: userId, otp_code: otpCode }),
      });
      const data = await res.json();
      if (res.ok) {
        if (suspicious) alert("⚠️ Warning: Login from a new device or IP detected!");
        window.location.href = `http://localhost:5000${data.redirect}`;
      } else {
        setError(data.error);
      }
    } catch {
      setError("Could not connect to server.");
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

          {/* Error */}
          {error && (
            <div className="mb-6">
              <div className={`border-l-4 p-4 rounded-lg flex items-center gap-3 ${cooldown > 0 ? "bg-amber-50 border-amber-500" : "bg-red-100 border-red-500"}`}>
                <span className={`material-symbols-outlined ${cooldown > 0 ? "text-amber-500" : "text-red-500"}`}>
                  {cooldown > 0 ? "timer" : "error"}
                </span>
                <div>
                  <p className={`text-sm font-medium ${cooldown > 0 ? "text-amber-700" : "text-red-700"}`}>
                    {cooldown > 0 ? `Too many failed attempts. Try again in` : error}
                  </p>
                  {cooldown > 0 && (
                    <p className="text-3xl font-black font-headline text-amber-600 mt-1">
                      {Math.floor(cooldown / 60)}:{String(cooldown % 60).padStart(2, "0")}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="bg-white/70 backdrop-blur-[20px] rounded-xl shadow-2xl p-8 md:p-10">

            {!otpStage ? (
              <>
                {/* LOGIN FORM */}
                <header className="mb-10">
                  <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-2">
                    Welcome Back
                  </h1>
                  <p className="text-on-surface-variant font-body">
                    Sign in to continue to your professional identity dashboard.
                  </p>
                </header>

                <div className="space-y-6">
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
                        placeholder="alex.rivera@example.com"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                      Password
                    </label>
                    <div className="relative group">
                      <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                        lock
                      </span>
                      <input
                        className="w-full pl-12 pr-12 py-4 bg-surface-container-low rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline/50 border-b-2 border-transparent focus:border-primary"
                        placeholder="••••••••"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleLogin()}
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
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={handleLogin}
                      disabled={loading}
                      className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25 flex justify-center items-center gap-2 disabled:opacity-60"
                    >
                      {loading ? "Signing in..." : "Login"}
                      {!loading && <span className="material-symbols-outlined">arrow_forward</span>}
                    </button>
                  </div>
                </div>

                <footer className="mt-8 text-center">
                  <p className="text-sm text-on-surface-variant">
                    Don't have an account?{" "}
                    <a className="text-primary font-bold hover:underline" href="/register">
                      Create account
                    </a>
                  </p>
                </footer>
              </>
            ) : (
              <>
                {/* OTP FORM */}
                <header className="mb-8">
                  <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      verified_user
                    </span>
                  </div>
                  <h1 className="font-headline font-extrabold text-3xl text-on-surface tracking-tight mb-2">
                    Verify Identity
                  </h1>
                  <p className="text-on-surface-variant">
                    Enter the OTP to complete sign in.
                  </p>
                </header>

                {/* OTP Display */}
                <div className="mb-6 p-4 bg-primary/5 border border-primary/20 rounded-xl text-center">
                  <p className="text-xs text-on-surface-variant uppercase tracking-widest mb-1">Your OTP (demo)</p>
                  <p className="text-4xl font-black font-headline tracking-[0.3em] text-primary">
                    {otpDisplay}
                  </p>
                  <p className="text-xs text-on-surface-variant mt-2">Expires in 5 minutes</p>
                </div>

                <div className="space-y-4">
                  <label className="block text-xs font-bold uppercase tracking-widest text-on-surface-variant ml-1">
                    Enter OTP
                  </label>
                  <div className="relative group">
                    <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline group-focus-within:text-primary transition-colors">
                      pin
                    </span>
                    <input
                      className="w-full pl-12 pr-4 py-4 bg-surface-container-low rounded-lg border-none focus:ring-0 focus:bg-surface-container-lowest transition-all duration-300 text-on-surface placeholder:text-outline/50 border-b-2 border-transparent focus:border-primary text-center text-2xl tracking-[0.5em] font-bold"
                      placeholder="000000"
                      type="text"
                      maxLength={6}
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleVerifyOTP()}
                    />
                  </div>

                  <button
                    onClick={handleVerifyOTP}
                    disabled={loading}
                    className="w-full py-4 px-6 bg-gradient-to-r from-primary to-primary-container text-white font-headline font-bold text-lg rounded-full hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 shadow-lg shadow-primary/25 flex justify-center items-center gap-2 disabled:opacity-60"
                  >
                    {loading ? "Verifying..." : "Verify OTP"}
                    {!loading && <span className="material-symbols-outlined">check_circle</span>}
                  </button>

                  <button
                    onClick={() => { setOtpStage(false); setError(""); setOtpCode(""); }}
                    className="w-full py-3 text-sm text-on-surface-variant hover:text-primary transition-colors"
                  >
                    ← Back to login
                  </button>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="hidden lg:block absolute right-12 bottom-12 w-64 h-64 overflow-hidden rounded-xl rotate-3 shadow-2xl">
          <img
            alt=""
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBvlJU3uUj1M61Rl0tuC2Hq9AYONGMgm_wWWJwq5fCfeANV4_ICg1uH-LWhV8g3a8ThYpZ6GZiUwxQ53ptEPr3aAZ2yDnRpcgck7T71Hw8-C9VnTycQg4klK_Ns5r2Jl_bfMX_vjjP2VPffkcCikwytNMIbMBNNoOQ7sGBlWTZoWnqDLlMv9Z5RPC5PWzsJzD4Rv8uO8u_rqGYBPrnKIQBGz8v6aZPha6uU9RpO9fcCqrZ9Fj6TSG-Wa6tEaCezrG_rpbmnSWiHpIkY"
          />
        </div>
      </main>
      <Footer />
    </div>
  );
}