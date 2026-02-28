"use client";

import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import useAuth from "@/hooks/useAuth";
import { poppins } from "@/styles/font";
import { AtSign, LockKeyhole, ShieldUser } from "lucide-react";
import { useRouter } from "next/navigation";
import { SyntheticEvent, useState } from "react";

export default function LoginPage() {
  const { login, loading, error } = useAuth();

  const router = useRouter();

  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");

  async function handleSubmit(event: SyntheticEvent<HTMLFormElement>) {
    event.preventDefault();

    try {
      const result = await login(email, password);

      if (result.success) {
        router.push("/");
      }
    } catch (error) {
      // dev-log
      console.log("error");
    } finally {
      setEmail("");
      setPassword("");
    }
  }

  return (
    <>
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div
          className={`bg-white p-8 rounded-xl w-full max-w-md shadow-xl border border-gray-100 ${poppins.className}`}
        >
          <div className="flex flex-col justify-center items-center gap-2 mb-8">
            <div className="bg-orange-50 p-3 rounded-full mb-4">
              <ShieldUser color="#ee5b2b" strokeWidth={1.5} size={25} />
            </div>

            <h1 className="text-2xl font-bold text-gray-900">Admin Login</h1>
            <p className="text-gray-500 text-sm">
              Enter your credentials to access the dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <Input
              type="email"
              autoComplete="email"
              label="Email Address"
              placeholder="admin@gmail.com"
              icon={AtSign}
              value={email}
              onChange={setEmail}
            />

            <Input
              type="password"
              label="Password"
              autoComplete="current-password"
              placeholder="•••••••••"
              icon={LockKeyhole}
              value={password}
              onChange={setPassword}
            />

            <Button
              type="submit"
              disabled={false}
              className="mt-4 bg-orange text-white cursor-pointer active:scale-[0.97] duration-200"
            >
              Login
            </Button>
          </form>
        </div>
      </div>
    </>
  );
}
