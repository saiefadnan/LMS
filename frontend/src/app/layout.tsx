import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

/**
 * Using Inter — widely recommended for educational platforms
 * because of its excellent readability at all sizes and its
 * friendly, modern personality without being distracting.
 * 
 * NOTE: No <AuthProvider> needed! Zustand works without
 * wrapping the tree. Components just call useAuthStore() directly.
 */
const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "LearnHub — Your Learning Journey Starts Here",
    template: "%s | LearnHub",
  },
  description:
    "A modern learning management system for students, instructors, and content creators. Browse courses, track progress, and achieve your goals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-surface-50 text-surface-900">
        {children}
      </body>
    </html>
  );
}
