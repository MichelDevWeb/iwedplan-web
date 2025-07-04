import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Playfair_Display, Great_Vibes } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import BackToTopButton from "@/components/common/BackToTopButton";
import PWAInstallBanner from "@/components/common/PWAInstallBanner";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ec4899" },
    { media: "(prefers-color-scheme: dark)", color: "#ec4899" },
  ],
  colorScheme: "light",
};

export const metadata: Metadata = {
  title: "iWedplan - Wedding Planner",
  description: "Ứng dụng lập kế hoạch đám cưới thông minh với AI Assistant. Tạo website cưới đẹp mắt và chuyên nghiệp.",
  keywords: ["đám cưới", "wedding planner", "website cưới", "AI assistant", "lập kế hoạch cưới"],
  authors: [{ name: "iWedplan Team" }],
  creator: "iWedplan",
  publisher: "iWedplan",
  applicationName: "iWedplan",
  generator: "Next.js",
  referrer: "origin-when-cross-origin",
  manifest: "/manifest.json",
  // appleWebApp: {
  //   capable: true,
  //   statusBarStyle: "default",
  //   title: "iWedplan",
  //   startupImage: [
  //     {
  //       media: "(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)",
  //       url: "/icons/apple-startup-320x568.png",
  //     },
  //     {
  //       media: "(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)",
  //       url: "/icons/apple-startup-375x667.png",
  //     },
  //     {
  //       media: "(device-width: 414px) and (device-height: 736px) and (-webkit-device-pixel-ratio: 3)",
  //       url: "/icons/apple-startup-414x736.png",
  //     },
  //     {
  //       media: "(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)",
  //       url: "/icons/apple-startup-375x812.png",
  //     },
  //   ],
  // },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: "website",
    siteName: "iWedplan",
    title: "iWedplan - Wedding Planner",
    description: "Ứng dụng lập kế hoạch đám cưới thông minh với AI Assistant",
    images: [
      {
        url: "/images/og-image.png",
        width: 1200,
        height: 630,
        alt: "iWedplan - Wedding Planning App",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "iWedplan - Wedding Planner",
    description: "Ứng dụng lập kế hoạch đám cưới thông minh với AI Assistant",
    images: ["/images/twitter-image.png"],
  },
  icons: {
    icon: [
      { url: "/icons/icon-16.svg", sizes: "16x16", type: "image/svg+xml" },
      { url: "/icons/icon-32.svg", sizes: "32x32", type: "image/svg+xml" },
      { url: "/icons/icon-192.svg", sizes: "192x192", type: "image/svg+xml" },
      { url: "/icons/icon-512.svg", sizes: "512x512", type: "image/svg+xml" },
    ],
    shortcut: [{ url: "/icons/icon-192.svg", sizes: "192x192" }],
    // apple: [
    //   { url: "/icons/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    // ],
  },
  other: {
    "mobile-web-app-capable": "yes",
    "apple-mobile-web-app-capable": "yes",
    "apple-mobile-web-app-status-bar-style": "default",
    "msapplication-TileColor": "#ec4899",
    "msapplication-TileImage": "/icons/ms-icon-144x144.svg",
    "msapplication-config": "/browserconfig.xml",
  },
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
          <BackToTopButton />
          <PWAInstallBanner />
        </AuthProvider>
      </body>
    </html>
  );
}
