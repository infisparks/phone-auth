"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, Phone, ArrowRight, Lock, CheckCircle2 } from "lucide-react";
import { OTPInput, SlotProps } from "input-otp";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

function Slot(props: SlotProps) {
  return (
    <div
      className={cn(
        "relative w-12 h-14 text-[2rem]",
        "flex items-center justify-center",
        "transition-all duration-300",
        "border-y border-r border-white/20 first:border-l first:rounded-l-lg last:rounded-r-lg",
        "group-hover:border-white/40 group-focus-within:border-white/50",
        "bg-white/5",
        { "outline outline-2 outline-blue-500 z-10": props.isActive }
      )}
    >
      {props.char !== null && <div>{props.char}</div>}
      {props.hasFakeCaret && (
        <FakeCaret />
      )}
    </div>
  );
}

function FakeCaret() {
  return (
    <div className="absolute pointer-events-none inset-0 flex items-center justify-center animate-caret-blink">
      <div className="w-px h-8 bg-blue-500" />
    </div>
  );
}

export default function LoginPage() {
  const [step, setStep] = useState<"phone" | "otp" | "success" | "already-logged-in">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setStep("already-logged-in");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      }
    };
    checkSession();
  }, [router]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (phone.length < 10) {
      setError("Please enter a valid phone number");
      return;
    }

    setIsLoading(true);

    console.log("Sending OTP to:", phone);

    const { error } = await supabase.auth.signInWithOtp({
      phone: `+91${phone}`, // Assuming +91 for now based on user context
    });

    setIsLoading(false);

    if (error) {
      console.error("Error sending OTP:", error);
      setError(error.message);
    } else {
      setStep("otp");
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (otp.length < 6) {
      setError("Please enter the full 6-digit code");
      return;
    }

    setIsLoading(true);

    const { error } = await supabase.auth.verifyOtp({
      phone: `+91${phone}`,
      token: otp,
      type: 'sms',
    });

    setIsLoading(false);

    if (error) {
      console.error("Error verifying OTP:", error);
      setError(error.message || "Invalid OTP");
    } else {
      setStep("success");
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    }
  };

  const reset = () => {
    setStep("phone");
    setOtp("");
    setPhone("");
    setError("");
  };

  // If checking session or already logged in, show a simple state or the phone form if not

  return (
    <div className="min-h-screen w-full flex items-center justify-center relative overflow-hidden bg-[#050511] text-white">
      {/* Background Gradients */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-20%] right-[-10%] w-[500px] h-[500px] rounded-full bg-purple-600/20 blur-[120px]" />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass rounded-2xl p-8 shadow-2xl shadow-black/50 overflow-hidden relative border border-white/10">

          {/* Header */}
          <div className="text-center mb-8 relative z-10">
            <motion.div
              layoutId="icon-container"
              className="w-16 h-16 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-2xl mx-auto flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20"
            >
              <AnimatePresence mode="wait">
                {(step === "phone" || step === "already-logged-in") && <Phone key="phone" className="text-white w-8 h-8" />}
                {step === "otp" && <Lock key="otp" className="text-white w-8 h-8" />}
                {step === "success" && <CheckCircle2 key="success" className="text-white w-8 h-8" />}
              </AnimatePresence>
            </motion.div>

            <motion.h2
              layoutId="title"
              className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70"
            >
              {step === "phone" && "Welcome Back"}
              {step === "already-logged-in" && "Welcome Back"}
              {step === "otp" && "Verify Identity"}
              {step === "success" && "Success!"}
            </motion.h2>

            <motion.p
              layoutId="subtitle"
              className="text-sm text-white/50 mt-2"
            >
              {step === "phone" && "Enter your phone number to continue"}
              {step === "already-logged-in" && "You are already logged in"}
              {step === "otp" && `Enter the code sent to ${phone}`}
              {step === "success" && "Redirecting to dashboard..."}
            </motion.p>
          </div>

          {/* Body */}
          <div className="relative z-10 min-h-[180px]">
            <AnimatePresence mode="wait" initial={false}>

              {/* ALREADY LOGGED IN VIEW */}
              {step === "already-logged-in" && (
                <motion.div
                  key="logged-in"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-center items-center py-8"
                >
                  <Loader2 className="animate-spin text-blue-500 w-8 h-8" />
                </motion.div>
              )}

              {/* PHONE FORM */}
              {step === "phone" && (
                <motion.form
                  key="phone-form"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleSendOtp}
                  className="space-y-6"
                >
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-white/70 uppercase tracking-wider ml-1">Phone Number</label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none border-r border-white/10 pr-3">
                        <span className="text-white/50 text-sm font-medium">🇮🇳 +91</span>
                      </div>
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-4 pl-24 pr-4 text-white placeholder:text-white/20 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 transition-all font-mono text-lg"
                      />
                    </div>
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm text-center">
                      {error}
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white font-medium py-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                  >
                    {isLoading ? (
                      <Loader2 className="animate-spin w-5 h-5" />
                    ) : (
                      <>
                        <span>Send Code</span>
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
                </motion.form>
              )}

              {/* OTP FORM */}
              {step === "otp" && (
                <motion.form
                  key="otp-form"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                  onSubmit={handleVerifyOtp}
                  className="space-y-8"
                >
                  <div className="flex justify-center">
                    <OTPInput
                      maxLength={6}
                      value={otp}
                      onChange={setOtp}
                      render={({ slots }) => (
                        <div className="flex gap-0 shadow-lg shadow-black/20 rounded-lg overflow-hidden">
                          {slots.map((slot, idx) => (
                            <Slot key={idx} {...slot} />
                          ))}
                        </div>
                      )}
                    />
                  </div>

                  {error && (
                    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-red-400 text-sm text-center">
                      {error}
                    </motion.div>
                  )}

                  <div className="space-y-4">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="w-full bg-white text-black font-bold py-4 rounded-xl transition-all shadow-lg hover:bg-gray-100 active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isLoading ? (
                        <Loader2 className="animate-spin w-5 h-5" />
                      ) : (
                        "Verify & Login"
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => setStep("phone")}
                      className="w-full text-white/50 text-sm hover:text-white transition-colors"
                    >
                      Change phone number
                    </button>
                  </div>
                </motion.form>
              )}

              {/* SUCCESS VIEW */}
              {step === "success" && (
                <motion.div
                  key="success-view"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-6 text-center py-6"
                >
                  <div className="text-white/80">
                    Verifying credential...
                  </div>
                  <Loader2 className="animate-spin w-8 h-8 text-blue-500 mx-auto" />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-white/30 text-xs mt-8">
          By continuing, you agree to our Terms of Service <br /> and Privacy Policy.
        </p>
      </motion.div>
    </div>
  );
}
