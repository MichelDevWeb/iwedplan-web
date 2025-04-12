import type { NextConfig } from "next";
import withPWAInit from "next-pwa";

const withPWA = withPWAInit({
  dest: "public",
  disable: process.env.NODE_ENV === "development", // Disable PWA in development
  // register: true, // Register service worker
  // skipWaiting: true, // Install new service worker without waiting
});

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
        // port: '', // Optional port
        // pathname: '/my-bucket/**', // Optional path matching
      },
    ],
  },
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
};

export default withPWA(nextConfig as any);
