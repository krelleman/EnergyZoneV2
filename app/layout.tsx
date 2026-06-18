// app/layout.tsx
import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import AuthModal from "@/components/AuthModal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "EnergyZone",
  description: "Opdag, bedøm og sammenlign energidrikke",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="da">
      <body className={`${geistSans.className} antialiased bg-gradient-to-b from-gray-900 to-black min-h-screen`}>
        <Header />
        {children}
        <AuthModal />
      </body>
    </html>
  );
}