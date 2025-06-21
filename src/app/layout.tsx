import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import { Inter } from "next/font/google";
import Navbar from "@/components/ui/Navbar";
import Provider from "@/trpc/Providers";

import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const inter = Inter({subsets: ['latin']})
const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "semanticPDF",
  description: "a chat to pdf application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <Provider>
      <body
        className={cn('min-h-screen font-sans antialiased grainy', inter.className)}
      >
          <Toaster />
          <Navbar />
        {children}  
      </body>
      </Provider>
    </html>
  );
}