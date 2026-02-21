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
            className="flex flex-col h-full p-6 md:p-8 absolute inset-0 bg-brand-bg"
            custom={custom}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={transitionSpec}
        >
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col">
                <div className="flex justify-center mt-6 mb-6 md:mt-10 md:mb-8 relative shrink-0">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-white shadow-lg flex items-center justify-center overflow-hidden relative z-10 p-1">
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
                        <Heart className="w-5 h-5 text-brand-red fill-brand-red" />
                    </div>
                </div>

                <div className="text-center mb-6 md:mb-8 shrink-0">
                    <h1 className="text-2xl md:text-3xl font-extrabold text-brand-dark mb-2">
                        Welcome Back!
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm">
                        Log in to continue your tasty journey
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col">
                    <label className="text-brand-dark font-semibold text-sm mb-2 ml-1">
                        Phone Number
                    </label>
                    <div className="relative flex items-center mb-6">
                        <input
                            ref={phoneInputRef}
                            type="tel"
                            placeholder="000-000-0000"
                            maxLength={10}
                            className="w-full bg-white rounded-2xl py-4 px-4 shadow-sm text-center text-lg font-medium text-brand-dark placeholder-gray-300 focus:outline-none focus:ring-2 focus:ring-red-200"
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
                        className="w-full bg-brand-red text-white rounded-2xl py-4 font-bold text-lg shadow-lg shadow-red-200 flex items-center justify-center gap-2 active:scale-95 transition-transform disabled:opacity-70 disabled:scale-100"
                    >
                        {isLoading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            <>
                                Send OTP <ArrowRight size={20} />
                            </>
                        )}
                    </button>
                </form>
            </div>

            <div className="text-center pt-4 shrink-0">
                <p className="text-[10px] text-gray-400">
                    By continuing, you agree to our{" "}
                    <span className="text-brand-red font-semibold">Terms</span> &{" "}
                    <span className="text-brand-red font-semibold">Privacy</span>
                </p>
            </div>
        </motion.div>
    );
}