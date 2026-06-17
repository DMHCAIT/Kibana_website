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
  const [acceptedPolicy, setAcceptedPolicy] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isNewUser, setIsNewUser] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (showAuthModal) {
      const shouldOpenSignup = authModalMessage.toLowerCase().includes("sign up");
      setTab(shouldOpenSignup ? "signup" : "login");
      setStep("email");
      setEmail("");
      setName("");
      setPhone("");
      setAcceptedPolicy(false);
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setLoading(false);
      setIsNewUser(false);
      setResendCooldown(0);
    }
  }, [showAuthModal, authModalMessage]);

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
    if (tab === "signup" && !acceptedPolicy) {
      setError("Please accept Privacy Policy and T&Cs to continue.");
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
      tab === "signup" ? name.trim() : undefined,
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
    const result = await verifyOtp(
      email,
      otpString,
      isNewUser ? { name: name.trim(), phone: phone.trim() } : undefined,
    );
    setLoading(false);

    if (result.error) {
      if (result.error === "Invalid or expired verification code") {
        setError(
          "The code you entered is incorrect or has expired. Please check your latest email or resend a new code.",
        );
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
      tab === "signup" ? name.trim() : undefined,
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-2 backdrop-blur-sm sm:p-4">
      <div className="relative max-h-[92vh] w-full max-w-sm overflow-y-auto rounded-lg bg-white shadow-2xl sm:max-w-md md:max-h-[95vh] md:max-w-2xl">
        <button
          onClick={closeAuthModal}
          className="absolute right-3 top-3 z-10 text-gray-400 transition-colors hover:text-gray-700 sm:right-4 sm:top-4"
          aria-label="Close"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="px-4 pb-6 pt-6 sm:px-8 sm:pt-8">
          <p className="mb-1 text-center font-display text-xs tracking-[0.3em] text-gray-500 sm:text-sm">
            KIBANA
          </p>
          <h2 className="mb-1 text-center font-display text-xl tracking-wide sm:text-2xl">
            {step === "email" ? (
              tab === "login" ? (
                <span className="inline-block px-1 text-base font-semibold tracking-[0.06em] text-amber-900 sm:text-lg">
                  SIGN UP &amp; GET UPTO 10% OFF
                </span>
              ) : (
                "Create Account"
              )
            ) : (
              "Check Your Email"
            )}
          </h2>

          {authModalMessage && (
            <p className="mb-4 mt-2 rounded border border-amber-200 bg-amber-50 px-3 py-2 text-center text-sm text-amber-700">
              {authModalMessage}
            </p>
          )}

          {step === "email" && (
            <>
              <div className="mb-6 mt-4 flex border-b border-gray-200">
                {(["login", "signup"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setTab(t);
                      setError("");
                      if (t === "login") setAcceptedPolicy(false);
                    }}
                    className={cn(
                      "flex-1 pb-2 text-sm font-medium tracking-wide transition-colors",
                      tab === t
                        ? "border-b-2 border-gray-900 text-gray-900"
                        : "text-gray-400 hover:text-gray-600",
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
                      <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-gray-500">
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
                      <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-gray-500">
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
                  <label className="mb-1 block text-xs font-medium uppercase tracking-widest text-gray-500">
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

                {tab === "signup" && (
                  <label className="flex items-start gap-2 rounded border border-gray-200 bg-gray-50 px-3 py-2 text-xs text-gray-600">
                    <input
                      type="checkbox"
                      checked={acceptedPolicy}
                      onChange={(e) => setAcceptedPolicy(e.target.checked)}
                      className="mt-0.5 h-4 w-4 accent-gray-900"
                    />
                    <span>
                      I accept that I have read &amp; understood your Privacy Policy and T&amp;Cs.
                    </span>
                  </label>
                )}

                {error && (
                  <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
                    {error}
                  </p>
                )}

                <Button
                  type="submit"
                  disabled={loading || (tab === "signup" && !acceptedPolicy)}
                  className="mt-1 flex h-10 w-full items-center justify-center gap-2 bg-gray-900 text-xs font-medium uppercase tracking-widest text-white hover:bg-gray-700 sm:h-11"
                >
                  <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  {loading ? "Sending..." : "Send code"}
                </Button>
              </form>

              <p className="mt-4 text-center text-xs text-gray-400">
                {tab === "login" ? (
                  <>
                    Don&apos;t have an account?{" "}
                    <button
                      onClick={() => {
                        setTab("signup");
                        setError("");
                      }}
                      className="text-gray-600 underline hover:text-gray-900"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <button
                      onClick={() => {
                        setTab("login");
                        setError("");
                      }}
                      className="text-gray-600 underline hover:text-gray-900"
                    >
                      Log in
                    </button>
                  </>
                )}
              </p>
            </>
          )}

          {step === "otp" && (
            <form onSubmit={handleVerifyOtp} className="mt-4 flex flex-col gap-4 sm:gap-5">
              <div className="text-center">
                <p className="text-xs text-gray-500 sm:text-sm">We sent a 6-digit code to</p>
                <p className="mt-0.5 break-all text-sm font-semibold text-gray-800">{email}</p>
                <button
                  type="button"
                  onClick={() => {
                    setStep("email");
                    setError("");
                    setOtp(["", "", "", "", "", ""]);
                  }}
                  className="mt-1 text-xs text-gray-400 underline hover:text-gray-600"
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
                    ref={(el) => {
                      otpRefs.current[i] = el;
                    }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    className="h-10 w-9 rounded border border-gray-300 text-center text-base font-semibold outline-none transition-colors focus:border-gray-900 focus:ring-1 focus:ring-gray-900 sm:h-12 sm:w-11 sm:text-lg"
                    aria-label={`Code digit ${i + 1}`}
                  />
                ))}
              </div>

              {error && (
                <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-center text-sm text-red-600">
                  {error}
                </p>
              )}

              <Button
                id="otp-submit-btn"
                type="submit"
                disabled={loading || otp.join("").length < 6}
                className="h-10 w-full bg-gray-900 text-xs font-medium uppercase tracking-widest text-white hover:bg-gray-700 sm:h-11"
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
                    "text-nowrap underline transition-colors",
                    resendCooldown > 0
                      ? "cursor-not-allowed text-gray-300"
                      : "text-gray-600 hover:text-gray-900",
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
