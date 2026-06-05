"use client";

import { useEffect, useRef, useState } from "react";
import { X, Mail, RefreshCw } from "lucide-react";
import { useAuth } from "@/store/auth-store";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type Step = "email" | "otp";

export function AuthModal() {
  const { showAuthModal, authModalMessage, closeAuthModal, sendOtp, verifyOtp } = useAuth();

  const [step, setStep] = useState<Step>("email");
  const [tab, setTab] = useState<"login" | "signup">("login");

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (showAuthModal) {
      setStep("email");
      setEmail("");
      setName("");
      setPhone("");
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
      setIsNewUser(false);
      setResendCooldown(0);
    }
  }, [showAuthModal]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [resendCooldown]);

  if (!showAuthModal) return null;

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const cleaned = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleaned)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (tab === "signup" && !name.trim()) {
      setError("Please enter your full name.");
      return;
    }
    if (tab === "signup" && !phone.trim()) {
      setError("Please enter your phone number.");
      return;
    }

    // Show visual feedback immediately
    setLoading(true);
    
    // Move to OTP step immediately (optimistic update)
    setIsNewUser(tab === "signup");
    setStep("otp");
    setResendCooldown(30);
    
    // Send OTP in background
    const result = await sendOtp(
      cleaned, 
      tab, 
      tab === "signup" ? phone.trim() : undefined,
      tab === "signup" ? name.trim() : undefined
    );
    
    setLoading(false);

    if (result.error === "not_found") {
      setError("No account found with this email. Please sign up first.");
      setStep("email");
      setTab("signup");
      return;
    }
    if (result.error === "already_exists") {
      setError("An account with this email already exists. Please sign in instead.");
      setStep("email");
      setTab("login");
      return;
    }
    if (result.error) {
      setError(result.error);
      setStep("email");
      return;
    }

    // Success - OTP form is already showing from optimistic update
    setTimeout(() => otpRefs.current[0]?.focus(), 50);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const otpString = otp.join("");
    if (otpString.length !== 6) {
      setError("Please enter the complete 6-digit code.");
      return;
    }

    // Show visual feedback immediately
    setLoading(true);

    // Verify OTP
    const result = await verifyOtp(email, otpString, isNewUser ? { name: name.trim(), phone: phone.trim() } : undefined);
    setLoading(false);

    if (result.error) {
      if (result.error === "Invalid or expired verification code") {
        setError("The code you entered is incorrect or has expired. Please check your latest email or resend a new code.");
      } else {
        setError(result.error);
      }
      setOtp(["", "", "", "", "", ""]);
      setTimeout(() => otpRefs.current[0]?.focus(), 50);
      return;
    }

    // Success! Modal will close automatically via auth state update
    setStep("email");
    setEmail("");
  };

  const handleOtpChange = (i: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = digit;
    setOtp(next);
    if (digit && i < 5) otpRefs.current[i + 1]?.focus();
    if (next.every((d) => d !== "")) {
      setTimeout(() => document.getElementById("otp-submit-btn")?.click(), 80);
    }
  };

  const handleOtpKeyDown = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus();
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    const digits = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, 6);
    if (digits.length === 6) {
      setOtp(digits.split(""));
      setTimeout(() => document.getElementById("otp-submit-btn")?.click(), 80);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError("");
    setOtp(["", "", "", "", "", ""]);
    setLoading(true);
    const result = await sendOtp(
      email, 
      tab, 
      tab === "signup" ? phone.trim() : undefined,
      tab === "signup" ? name.trim() : undefined
    );
    setLoading(false);
    if (result.error) {
      setError(result.error);
    } else {
      setResendCooldown(30);
      setTimeout(() => otpRefs.current[0]?.focus(), 100);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-2 sm:p-4">
      <div className="relative w-full max-w-sm sm:max-w-md md:max-w-2xl rounded-lg bg-white shadow-2xl max-h-[92vh] md:max-h-[95vh] overflow-y-auto">
        <button
          onClick={closeAuthModal}
          className="absolute right-3 top-3 sm:right-4 sm:top-4 text-gray-400 hover:text-gray-700 transition-colors z-10"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-4 sm:px-8 pt-6 sm:pt-8 pb-6">
          <p className="font-display text-center tracking-[0.3em] text-xs sm:text-sm text-gray-500 mb-1">KIBANA</p>
          <h2 className="text-center font-display text-xl sm:text-2xl tracking-wide mb-1">
            {step === "email"
              ? tab === "login" ? "Welcome Back" : "Create Account"
              : "Check Your Email"}
          </h2>

          {authModalMessage && (
            <p className="text-center text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded px-3 py-2 mb-4 mt-2">
              {authModalMessage}
            </p>
          )}

          {step === "email" && (
            <>
              <div className="flex border-b border-gray-200 mb-6 mt-4">
                {(["login", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => { setTab(t); setError(""); }}
                    className={cn(
                      "flex-1 pb-2 text-sm font-medium tracking-wide transition-colors",
                      tab === t
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-400 hover:text-gray-600"
                    )}
                  >
                    {t === "login" ? "LOGIN" : "SIGN UP"}
                  </button>
                ))}
              </div>

              <form onSubmit={handleSendOtp} className="flex flex-col gap-3 sm:gap-4">
                {tab === "signup" && (
                  <>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Jane Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                        className="h-10 sm:h-11"
                      />
                    </div>
                    <div>
                      <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                        Phone Number
                      </label>
                      <Input
                        type="tel"
                        placeholder="+91 98765 43210"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        required
                        className="h-10 sm:h-11"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label className="text-xs font-medium uppercase tracking-widest text-gray-500 mb-1 block">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoFocus
                    className="h-10 sm:h-11"
                  />
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</p>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="mt-1 h-10 sm:h-11 w-full bg-gray-900 text-white hover:bg-gray-700 font-medium tracking-widest text-xs uppercase flex items-center justify-center gap-2"
                >
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {loading ? "Sending..." : "Send code"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                {tab === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button onClick={() => { setTab("signup"); setError(""); }} className="underline text-gray-600 hover:text-gray-900">
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button onClick={() => { setTab("login"); setError(""); }} className="underline text-gray-600 hover:text-gray-900">
                      Log in
                    </button>
                  </>
                )}
              </p>
            </>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4 sm:gap-5 mt-4">
              <div className="text-center">
                <p className="text-xs sm:text-sm text-gray-500">We sent a 6-digit code to</p>
                <p className="font-semibold text-gray-800 mt-0.5 text-sm break-all">{email}</p>
                <button
                  type="button"
                  onClick={() => { setStep("email"); setError(""); setOtp(["", "", "", "", "", ""]); }}
                  className="mt-1 text-xs underline text-gray-400 hover:text-gray-600"
                >
                  Change email
                </button>
              </div>

              <p className="text-center text-xs text-gray-400">
                Check your inbox (and spam folder). The code expires in 10 minutes.
              </p>

              <div className="flex justify-center gap-1 sm:gap-2" onPaste={handleOtpPaste}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="w-9 h-10 sm:w-11 sm:h-12 rounded text-center text-base sm:text-lg font-semibold border border-gray-300 focus:border-gray-900 focus:ring-1 focus:ring-gray-900 outline-none transition-colors"
                    aria-label={`Code digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && (
                <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 text-center">{error}</p>
              )}

              <Button
                id="otp-submit-btn"
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="h-10 sm:h-11 w-full bg-gray-900 text-white hover:bg-gray-700 font-medium tracking-widest text-xs uppercase"
              >
                {loading ? "Verifying..." : isNewUser ? "Create Account" : "Verify & Login"}
              </Button>

              <div className="text-center text-xs text-gray-400">
                Didn&apos;t receive the code?{" "}
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resendCooldown > 0 || loading}
                  className={cn(
                    "underline transition-colors text-nowrap",
                    resendCooldown > 0
                      ? "text-gray-300 cursor-not-allowed"
                      : "text-gray-600 hover:text-gray-900"
                  )}
                >
                  {resendCooldown > 0 ? (
                    <span className="inline-flex items-center gap-1">
                      <RefreshCw className="h-3 w-3" />
                      Resend in {resendCooldown}s
                    </span>
                  ) : (
                    "Resend code"
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
