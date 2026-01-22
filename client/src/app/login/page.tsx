'use client';

import { useState, useRef, useEffect, ChangeEvent, KeyboardEvent } from 'react';
import { motion, AnimatePresence, Transition } from 'framer-motion';
import { ArrowRight, ChevronLeft, Heart, Mail } from 'lucide-react';
import { useRouter } from 'next/navigation';

type Step = 'PHONE' | 'OTP';

// === Animation Variants ===
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? '100%' : '-100%',
    opacity: 1,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? '100%' : '-100%',
    opacity: 1,
  }),
};

const transitionSpec: Transition = {
  x: { type: "spring", stiffness: 300, damping: 30 },
  opacity: { duration: 0.2 }
};

export default function LoginPage() {
  const [step, setStep] = useState<Step>('PHONE');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [direction, setDirection] = useState(0);
  const router = useRouter();

  const handleNext = (phone: string) => {
    setDirection(1);
    setPhoneNumber(phone);
    setStep('OTP');
  };

  const handleBack = () => {
    setDirection(-1);
    setStep('PHONE');
  };

  const handleLoginSuccess = () => {
    router.push('/');
  };

  return (
    // 1. MAIN CONTAINER (Matches Home Page)
    // - No black background
    // - Centered on Desktop (md:max-w-md md:mx-auto)
    // - Full Height on Mobile (h-[100dvh])
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg relative shadow-xl overflow-hidden">
        
      <AnimatePresence initial={false} custom={direction}>
        {step === 'PHONE' && (
          <PhoneStep 
            key="phone" 
            custom={direction}
            onNext={handleNext} 
          />
        )}
        {step === 'OTP' && (
          <OtpStep 
            key="otp" 
            custom={direction}
            phoneNumber={phoneNumber}
            onBack={handleBack}
            onSuccess={handleLoginSuccess}
          />
        )}
      </AnimatePresence>
      
    </main>
  );
}

// --- SUB-COMPONENTS ---

function PhoneStep({ onNext, custom }: { onNext: (phone: string) => void, custom: number }) {
  const [phone, setPhone] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length > 3) onNext(phone);
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
      {/* Scrollable Content Wrapper to prevent cut-off on tiny screens */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
        
        <div className="flex justify-center mt-6 mb-6 md:mt-10 md:mb-8 relative shrink-0">
          <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden relative z-10 p-1">
              {/* Ensure image path is correct */}
              <img src="/images/burgers.jpeg" alt="Burger" className="w-full h-full object-cover rounded-full"/>
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
              <div className="absolute left-4 flex items-center gap-2 border-r border-gray-200 pr-3">
                  <span className="text-brand-dark font-bold text-sm">🇺🇸 +1</span>
              </div>
              <input 
                  type="tel" 
                  placeholder="000-000-0000"
                  className="w-full bg-white rounded-2xl py-4 pl-24 pr-4 shadow-sm text-lg font-medium text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
              />
          </div>
          <button type="submit" className="w-full bg-brand-red text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-transform">
              Send OTP <ArrowRight size={20} />
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

function OtpStep({ phoneNumber, onBack, onSuccess, custom }: { phoneNumber: string, onBack: () => void, onSuccess: () => void, custom: number }) {
  const [otp, setOtp] = useState(['', '', '', '']);
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
    if (value && index < 3) inputRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.every(digit => digit !== '')) onSuccess();
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
      {/* Scrollable Wrapper */}
      <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">

        <div className="flex items-center justify-between mb-6 mt-2 md:mb-8 md:mt-4 shrink-0">
            <button onClick={onBack} className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center text-brand-dark hover:bg-gray-50">
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
            <p className="text-gray-500 text-sm mb-1">We have sent the code to</p>
            <p className="text-brand-dark font-bold text-sm mb-2">{phoneNumber || '+1 (555) 234-5678'}</p>
            <button onClick={onBack} className="text-brand-red font-semibold text-xs flex items-center justify-center gap-1 mx-auto">Wrong number?</button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col">
            <div className="flex justify-between gap-3 mb-10 px-0 md:px-2">
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
                        className="w-14 h-14 md:w-16 md:h-16 bg-white rounded-2xl shadow-sm text-center text-2xl font-bold text-brand-dark focus:outline-none focus:ring-2 focus:ring-red-200 focus:bg-white transition-all"
                    />
                ))}
            </div>
            <button type="submit" className="w-full bg-brand-red text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-red-200 active:scale-95 transition-transform">
                Verify & Proceed
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