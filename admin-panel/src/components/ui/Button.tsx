import { ReactNode } from "react";

interface ButtonProps {
  type: "submit" | "reset" | "button" | undefined;
  disabled: boolean;
  children: ReactNode;
  className?: string;
}

export default function Button({
  type,
  disabled = false,
  children,
  className,
}: ButtonProps) {
  return (
    <>
      <button
        type={type}
        disabled={disabled}
        className={`w-full font-bold py-3 rounded-lg ${className}`}
      >
        {children}
      </button>
    </>
  );
}
