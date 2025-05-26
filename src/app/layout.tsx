import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display, Great_Vibes } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import FloatingActionButton from "@/components/common/FloatingActionButton";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

const greatVibes = Great_Vibes({
  subsets: ['latin'],
  weight: '400',
  variable: '--font-script',
  display: 'swap',
});

export const metadata: Metadata = {
  title: "iWedPlan",
  description: "iWedPlan - Tạo website cưới đẹp mắt và chuyên nghiệp",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} ${greatVibes.variable} antialiased font-serif`}
      >
        <AuthProvider>
          {children}
          <Toaster richColors position="top-center" />
          <FloatingActionButton />
        </AuthProvider>
      </body>
    </html>
  );
}
