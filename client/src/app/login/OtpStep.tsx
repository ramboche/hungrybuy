"use client"

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from "react";
import { motion, Transition } from "framer-motion";
import { ChevronLeft, Mail, Loader2 } from "lucide-react";
 
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
      className="flex flex-col h-full p-6 md:p-8 absolute inset-0 bg-brand-bg"
      custom={custom}
      variants={slideVariants}
      initial="enter"
      animate="center"
      exit="exit"
      transition={transitionSpec}
    >
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        {/* Header UI (Unchanged) */}
        <div className="flex items-center justify-between mb-6 mt-2 md:mb-8 md:mt-4 shrink-0">
          <button
            onClick={onBack}
            disabled={isLoading}
            className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-dark hover:bg-gray-50"
          >
            <ChevronLeft size={24} />
          </button>
          <h2 className="text-brand-dark font-bold text-lg">Verification</h2>
          <div className="w-10"></div>
        </div>

        <div className="flex justify-center mb-6 shrink-0">
          <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center">
            <div className="bg-red-50 p-4 rounded-full">
              <Mail className="w-8 h-8 text-brand-red fill-brand-red" />
            </div>
          </div>
        </div>

        <div className="text-center mb-8 shrink-0">
          <h1 className="text-2xl font-extrabold text-brand-dark mb-2">
            Verification Code
          </h1>
          <p className="text-gray-500 text-sm mb-1">Code sent to</p>
          <p className="text-brand-dark font-bold text-sm mb-2">
            {phoneNumber}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center gap-2 mb-10 px-0 md:px-2">
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
                className="w-10 h-12 md:w-14 md:h-14 bg-white rounded-xl shadow-sm text-center text-xl font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all"
                disabled={isLoading}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.join("").length < 6}
            className="w-full bg-brand-red text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-red-200 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100 flex justify-center"
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
        <p className="text-gray-500 text-sm mb-2">Didn&apos;t receive the code?</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-brand-red font-bold cursor-pointer">
            Resend Code
          </span>
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">
            00:{timer < 10 ? `0${timer}` : timer}
          </span>
        </div>
      </div>
    </motion.div>
  );
}
