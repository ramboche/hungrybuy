'use client';

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { ArrowRight, ChevronLeft, Heart, Mail, Loader2 } from 'lucide-react'; // Added Loader2
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast'; // --- INTEGRATION: For alerts
import { api } from '@/lib/api';          // --- INTEGRATION: API Helper
import { useAuth } from '@/context/AuthContext'; // --- INTEGRATION: Auth Context

type Step = 'PHONE' | 'OTP';

// === Animation Variants (Unchanged) ===
const slideVariants = {
  enter: (direction: number) => ({ x: direction > 0 ? '100%' : '-100%', opacity: 1 }),
  center: { x: 0, opacity: 1 },
  exit: (direction: number) => ({ x: direction < 0 ? '100%' : '-100%', opacity: 1 }),
};

const transitionSpec: Transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
};

export default function LoginPage() {
  const [step, setStep] = useState<Step>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // --- INTEGRATION: Loading state
  const router = useRouter();
  const { login } = useAuth(); // --- INTEGRATION: Get login function

  // --- INTEGRATION: Handle Step 1 (Send OTP)
  const handleSendOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      // 1. Validate Phone (Simple check)
      if (phone.length < 10) throw new Error("Invalid phone number");

      // 2. Call Backend
      await api.post('/auth/send-otp', { phone });

      // 3. Update UI on Success
      setDirection(1);
      setPhoneNumber(phone);
      setStep('OTP');
      toast.success("Code sent!");
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep('PHONE');
  };

  // --- INTEGRATION: Handle Step 2 (Verify & Login)
  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    try {
      // 1. Try to Login 
      const res = await api.post('/auth/login', { phone: phoneNumber, otp });

      // 2. Success: Save user & Redirect
      const { token, data } = res.data;
      login(token, data.user);

      toast.success("Welcome back!");
      router.push('/');

    } catch (error: any) {
      // 3. Handle 404 (User not found) -> Auto Register or Error
      if (error.response?.status === 404) {
        try {
          // Optional: Auto-register if user doesn't exist
          const regRes = await api.post('/auth/register', { phone: phoneNumber, otp, name: 'New User' });
          const { token, data } = regRes.data;
          login(token, data.user);
          router.push('/');
          toast.success("Account created!");
        } catch (regError) {
          toast.error("Registration failed.");
        }
      } else {
        toast.error(error.response?.data?.message || "Invalid Code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg relative shadow-xl overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        {step === 'PHONE' && (
          <PhoneStep
            key="phone"
            custom={direction}
            onNext={handleSendOtp} // Pass the async handler
            isLoading={isLoading}  // Pass loading state
          />
        )}
        {step === 'OTP' && (
          <OtpStep
            key="otp"
            custom={direction}
            phoneNumber={phoneNumber}
            onBack={handleBack}
            onVerify={handleVerifyOtp} // Pass the async handler
            isLoading={isLoading}      // Pass loading state
          />
        )}
      </AnimatePresence>
    </main>
  );
}

// --- SUB-COMPONENTS ---

// 1. Phone Step
function PhoneStep({ onNext, custom, isLoading }: { onNext: (phone: string) => void, custom: number, isLoading: boolean }) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length >= 10) onNext(phone);
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
        {/* ... (Your existing Image/Header UI code here is fine) ... */}
        <div className="flex justify-center mt-6 mb-6 md:mt-10 md:mb-8 relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden relative z-10 p-1">
            <img src="/images/burgers.jpeg" alt="Burger" className="w-full h-full object-cover rounded-full" />
          </div>
          <div className="absolute bottom-2 right-[28%] bg-white p-2.5 rounded-full shadow-md z-20">
            <Heart className="w-5 h-5 text-brand-red fill-brand-red" />
          </div>
        </div>

        <div className="text-center mb-6 md:mb-8 shrink-0">
          <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-2">Welcome Back!</h1>
          <p className="text-gray-500 text-xs md:text-sm">Log in to continue your tasty journey</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <label className="text-brand-dark font-semibold text-sm mb-2 ml-1">Phone Number</label>
          <div className="relative flex items-center mb-6">
            <input
              type="tel"
              placeholder="000-000-0000"
              maxLength={10} // Native limit
              className="w-full bg-white rounded-2xl py-4 px-4 shadow-sm text-center text-lg font-medium text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200"
              value={phone}
              onChange={(e) => {
                // 1. Remove any non-number characters
                const onlyNums = e.target.value.replace(/[^0-9]/g, '');
                // 2. Only update if length is 10 or less
                if (onlyNums.length <= 10) {
                  setPhone(onlyNums);
                }
              }}
              disabled={isLoading}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading || phone.length < 10}
            className="w-full bg-brand-red text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : <>Send OTP <ArrowRight size={20} /></>}
          </button>
        </form>
      </div>

      <div className="text-center pt-4 shrink-0">
        <p className="text-[10px] text-gray-400">
          By continuing, you agree to our <span className="text-brand-red font-semibold">Terms</span> & <span className="text-brand-red font-semibold">Privacy</span>
        </p>
      </div>
    </motion.div>
  );
}

// 2. OTP Step
function OtpStep({ phoneNumber, onBack, onVerify, custom, isLoading }: { phoneNumber: string, onBack: () => void, onVerify: (otp: string) => void, custom: number, isLoading: boolean }) {
  const [otp, setOtp] = useState(['', '', '', '', '', '']); // Changed to 6 digits (Backend Standard)
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [timer, setTimer] = useState(45);

  useEffect(() => {
    const interval = setInterval(() => setTimer((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (index: number, e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (isNaN(Number(value))) return;
    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);
    if (value && index < 5) inputRefs.current[index + 1]?.focus(); // Updated index check for 6 digits
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join('');
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
          <button onClick={onBack} disabled={isLoading} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-dark hover:bg-gray-50">
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
          <h1 className="text-2xl font-extrabold text-brand-dark mb-2">Verification Code</h1>
          <p className="text-gray-500 text-sm mb-1">Code sent to</p>
          <p className="text-brand-dark font-bold text-sm mb-2">{phoneNumber}</p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="flex justify-center gap-2 mb-10 px-0 md:px-2">
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => { inputRefs.current[index] = el }}
                type="text"
                maxLength={1}
                inputMode="numeric"
                value={digit}
                onChange={(e) => handleChange(index, e)}
                onKeyDown={(e) => handleKeyDown(index, e)}
                // Adjusted sizing for 6 digits
                className="w-10 h-12 md:w-14 md:h-14 bg-white rounded-xl shadow-sm text-center text-xl font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all"
                disabled={isLoading}
              />
            ))}
          </div>
          <button
            type="submit"
            disabled={isLoading || otp.join('').length < 6}
            className="w-full bg-brand-red text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-red-200 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100 flex justify-center"
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Verify & Proceed"}
          </button>
        </form>
      </div>

      <div className="text-center pt-4 shrink-0">
        <p className="text-gray-500 text-sm mb-2">Didn't receive the code?</p>
        <div className="flex items-center justify-center gap-2">
          <span className="text-brand-red font-bold cursor-pointer">Resend Code</span>
          <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded text-xs font-mono">00:{timer < 10 ? `0${timer}` : timer}</span>
        </div>
      </div>
    </motion.div>
  );
}