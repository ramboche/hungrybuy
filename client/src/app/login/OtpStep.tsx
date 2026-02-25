"use client"

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { motion, Transition } from "framer-motion";
import { Mail, Loader2, ArrowLeft } from "lucide-react";

// === Animation Variants (Unchanged) ===
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? "100%" : "-100%",
    opacity: 1,
  }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({
    x: direction < 0 ? "100%" : "-100%",
    opacity: 1,
  }),
};

const transitionSpec: Transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 },
};

export default function OtpStep({
  phoneNumber,
  onBack,
  onVerify,
  custom,
  isLoading,
}: {
  phoneNumber: string;
  onBack: () => void;
  onVerify: (otp: string) => void;
  custom: number;
  isLoading: boolean;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(45);

  // 1. Existing Timer Logic
  useEffect(() => {
    const interval = setInterval(
      () => setTimer((prev) => (prev > 0 ? prev - 1 : 0)),
      1000,
    );
    return () => clearInterval(interval);
  }, []);

  // 2. NEW: Focus first input on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  // ... (Rest of logic: handleChange, handleKeyDown, handleSubmit is Unchanged) ...
  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");
    if (fullOtp.length === 6) onVerify(fullOtp);
  };

  return (
    <motion.div
      className="flex flex-col h-full p-6 md:p-8 absolute inset-0 bg-white"
      custom={custom}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitionSpec}
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        {/* Header UI */}
        <div className="flex items-center justify-between mb-6 mt-2 md:mb-8 md:mt-4 shrink-0 relative">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="p-2 -ml-2 text-gray-900 active:scale-90 transition-transform rounded-full hover:bg-gray-100 z-10"
          >
            <ArrowLeft size={24} strokeWidth={2.5} />
          </button>
          {/* Centered Title */}
          <h2 className="text-gray-900 font-bold text-lg absolute left-1/2 -translate-x-1/2">
            Verification
          </h2>
          <div className="w-8"></div>
        </div>

        <div className="flex justify-center mb-8 shrink-0">
          <div className="w-24 h-24 bg-brand-orange-light rounded-full flex items-center justify-center">
            <div className="bg-[#faeae0] p-4 rounded-full">
              <Mail className="w-8 h-8 text-brand-orange fill-brand-orange" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8 shrink-0">
          <h1 className="text-2xl font-extrabold text-gray-900 mb-2 tracking-tight">
            Verification Code
          </h1>
          <p className="text-gray-500 text-sm mb-1 font-medium">Code sent to</p>
          <p className="text-gray-900 font-black text-base mb-2">
            {phoneNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center gap-3 mb-10 px-0 md:px-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => {
                  inputRefs.current[index] = el;
                }}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                className="w-10 h-12 sm:w-12 sm:h-14 bg-gray-50 border border-gray-100 rounded-xl shadow-sm text-center text-2xl font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange focus:bg-white transition-all"
                disabled={isLoading}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className="w-full bg-brand-orange text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-brand-orange/25 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100 flex justify-center"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Verify & Proceed"
            )}
          </button>
        </form>
      </div>

      <div className="text-center pt-4 shrink-0">
        <p className="text-gray-500 text-sm mb-2 font-medium">Didn&apos;t receive the code?</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-brand-orange font-bold cursor-pointer hover:opacity-80 transition-opacity">
            Resend Code
          </span>
          <span className="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs font-bold font-mono">
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
