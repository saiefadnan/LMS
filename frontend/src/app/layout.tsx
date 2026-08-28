import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { GlobalModal } from "@/components/ui/GlobalModal";
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
    <html lang="en" suppressHydrationWarning className={`${inter.variable} h-full antialiased`}>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var raw = localStorage.getItem('learnhub-theme');
                  var theme = 'system';
                  if (raw) {
                    var parsed = JSON.parse(raw);
                    theme = parsed.state && parsed.state.theme ? parsed.state.theme : parsed.theme || 'system';
                  }
                  var isDark = theme === 'dark' || (theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
                  if (isDark) {
                    document.documentElement.classList.add('dark');
                  } else {
                    document.documentElement.classList.remove('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body suppressHydrationWarning className="min-h-full flex flex-col bg-surface-50 dark:bg-surface-950 text-surface-900 dark:text-surface-100 transition-colors duration-150">
        {children}
        <GlobalModal />
      </body>
    </html>
  );
}
