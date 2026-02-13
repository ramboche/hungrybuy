"use client";

import { useState } from "react";
import { AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { AxiosError } from 'axios';
import PhoneStep from "./PhoneStep";
import OtpStep from "./OtpStep";

type Step = "PHONE" | "OTP";

export default function LoginPage() {
  const [step, setStep] = useState<Step>("PHONE");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [direction, setDirection] = useState(0);
  const [isLoading, setIsLoading] = useState(false); 
  const router = useRouter();
  const { login } = useAuth(); 

  // --- INTEGRATION: Handle Step 1 (Send OTP)
  const handleSendOtp = async (phone: string) => {
    setIsLoading(true);
    try {
      if (phone.length < 10) throw new Error("Invalid phone number");

      await api.post("/auth/send-otp", { phone });

      setDirection(1);
      setPhoneNumber(phone);
      setStep("OTP");
      toast.success("Code sent!");
    } catch (error) {
      console.error(error);
      const err = error as AxiosError<{ message: string }>;
      toast.error(err.response?.data?.message || "Failed to send code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setDirection(-1);
    setStep("PHONE");
  };

  // --- INTEGRATION: Handle Step 2 (Verify & Login)
  const handleVerifyOtp = async (otp: string) => {
    setIsLoading(true);
    try {
      const res = await api.post("/auth/login", { phone: phoneNumber, otp });

      const { token, data } = res.data;
      login(token, data.user);

      toast.success("Login Successful!");
      router.push("/");
    } catch (error) {

      const err = error as AxiosError<{ message: string }>;
      if (err.response?.status === 404) {
        try {
          const regRes = await api.post("/auth/register", {
            phone: phoneNumber,
            otp,
            name: "New User",
          });
          const { token, data } = regRes.data;
          login(token, data.user);
          router.push("/");
          toast.success("Account created!");
        } catch {
          toast.error("Registration failed.");
        }
      } else {
        toast.error(err.response?.data?.message || "Invalid Code");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="h-dvh w-full md:max-w-md md:mx-auto bg-brand-bg relative shadow-xl overflow-hidden">
      <AnimatePresence initial={false} custom={direction}>
        {step === "PHONE" && (
          <PhoneStep
            key="phone"
            custom={direction}
            onNext={handleSendOtp} 
            isLoading={isLoading} 
          />
        )}
        {step === "OTP" && (
          <OtpStep
            key="otp"
            custom={direction}
            phoneNumber={phoneNumber}
            onBack={handleBack}
            onVerify={handleVerifyOtp}
            isLoading={isLoading} 
          />
        )}
      </AnimatePresence>
    </main>
  );
}

