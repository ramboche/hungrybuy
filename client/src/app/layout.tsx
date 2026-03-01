import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { Toaster } from 'react-hot-toast';
import "./globals.css";
import StoreProvider from "@/components/providers/StoreProvider";

// Configure the font
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Regular, Medium, SemiBold, Bold
});

export const metadata: Metadata = {
  title: "Hungrybuy",
  description: "Order your favorite food",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={poppins.className}>
        <StoreProvider>
          <Toaster position="top-center" />
          {children}
        </StoreProvider>
      </body>
    </html>
  );
}