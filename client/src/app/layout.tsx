import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import { AuthProvider } from '@/context/AuthContext';
import { Toaster } from 'react-hot-toast';
import "./globals.css";

// Configure the font
const poppins = Poppins({ 
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"], // Regular, Medium, SemiBold, Bold
});

export const metadata: Metadata = {
  title: "Food App",
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
        {/* WRAP CHILDREN IN AUTHPROVIDER */}
        <AuthProvider>
          {children}
          <Toaster position="top-center" /> {/* This shows the success/error popups */}
        </AuthProvider>
      </body>
    </html>
  );
}