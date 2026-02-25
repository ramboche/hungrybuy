"use client"

import { useState, useRef, useEffect } from "react";
import { motion, Transition } from "framer-motion";
import { ArrowRight, Loader2, Heart } from "lucide-react";
import Image from "next/image";

// === Animation Variants ===
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


export default function PhoneStep({
    onNext,
    custom,
    isLoading,
}: {
    onNext: (phone: string) => void;
    custom: number;
    isLoading: boolean;
}) {
    const [phone, setPhone] = useState("");

    const phoneInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            phoneInputRef.current?.focus();
        }, 100);
        return () => clearTimeout(timer);
    }, []);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length >= 10) onNext(phone);
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
                <div className="flex justify-center mt-6 mb-6 md:mt-10 md:mb-8 relative shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] flex items-center justify-center overflow-hidden relative z-10 p-1">
                        <div className="relative w-full h-full">
                            <Image
                                src="/images/burgers.jpeg"
                                alt="Burger"
                                fill
                                className="object-cover rounded-full"
                                sizes="100px"
                            />
                        </div>
                    </div>
                    <div className="absolute bottom-2 right-[28%] bg-white p-2.5 rounded-full shadow-md z-20">
                        <Heart className="w-5 h-5 text-brand-orange fill-brand-orange" />
                    </div>
                </div>

                <div className="text-center mb-8 md:mb-10 shrink-0">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 mb-2 tracking-tight">
                        Welcome Back!
                    </h1>
                    <p className="text-gray-500 text-sm font-medium">
                        Log in to continue your tasty journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label className="text-gray-900 font-bold text-sm mb-2 ml-1">
                        Phone Number
                    </label>
                    <div className="relative flex items-center mb-6">
                        <input
                            ref={phoneInputRef}
                            type="tel"
                            placeholder="000-000-0000"
                            maxLength={10}
                            className="w-full bg-gray-50 border border-gray-100 rounded-2xl py-4 px-4 text-center text-xl font-bold text-gray-900 placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-brand-orange/20 focus:border-brand-orange focus:bg-white transition-all"
                            value={phone}
                            onChange={(e) => {
                                const onlyNums = e.target.value.replace(/[^0-9]/g, "");
                                if (onlyNums.length <= 10) setPhone(onlyNums);
                            }}
                            disabled={isLoading}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={isLoading || phone.length < 10}
                        className="w-full bg-brand-orange text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-brand-orange/25 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-50 disabled:active:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Send OTP <ArrowRight size={20} strokeWidth={2.5} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="text-center pt-4 shrink-0">
                <p className="text-[11px] text-gray-500 font-medium">
                    By continuing, you agree to our{" "}
                    <span className="text-brand-orange font-bold cursor-pointer">Terms</span> &{" "}
                    <span className="text-brand-orange font-bold cursor-pointer">Privacy</span>
                </p>
            </div>
        </motion.div>
    );
}