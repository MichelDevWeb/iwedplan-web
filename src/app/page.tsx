"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import HeroSection from "@/components/sections/HeroSection";
import VideoSection from "@/components/sections/VideoSection";
import AlbumSection from "@/components/sections/AlbumSection";
import CalendarSection from "@/components/sections/CalendarSection";
import StorySection from "@/components/sections/StorySection";
import BrideGroomSection from "@/components/sections/BrideGroomSection";
import EventsSection from "@/components/sections/EventsSection";
import WishesSection from "@/components/sections/WishesSection";
import GiftSection from "@/components/sections/GiftSection";
import Footer from "@/components/common/Footer";
import { getWeddingWebsite } from "@/lib/firebase/weddingService";
import { WeddingData } from "@/lib/firebase/models";
// TODO: Add RSVP handling (maybe a separate component or modal)

export default function Home() {
  const router = useRouter();
  const [weddingData, setWeddingData] = useState<WeddingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check the pathname to extract wedding ID if present
    const pathname = window.location.pathname;
    if (pathname === '/' || pathname === '') {
      // If no wedding ID in URL, redirect to landing page
      router.push("/landing");
      return;
    }

    // Get wedding ID from the path
    const weddingId = pathname.substring(1); // Remove the leading slash

    // Load wedding data
    const loadWeddingData = async () => {
      try {
        const data = await getWeddingWebsite(weddingId);
        if (data) {
          setWeddingData(data);
        } else {
          // Wedding not found, redirect to landing
          router.push("/landing");
        }
      } catch (error) {
        console.error("Error loading wedding data:", error);
        router.push("/landing");
      } finally {
        setLoading(false);
      }
    };

    loadWeddingData();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!weddingData) {
    return null; // Will be redirected to landing page
  }

  // We're going to render only the HeroSection with weddingData prop for now
  // This approach allows us to gradually migrate other components one by one
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-0">
        <HeroSection weddingData={weddingData} />
        {/* Other sections temporarily use the original implementation */}
        <VideoSection />
        <AlbumSection />
        <CalendarSection />
        <StorySection />
        <BrideGroomSection />
        <EventsSection />
        <WishesSection />
        <GiftSection />
      </main>
      <Footer />
    </div>
  );
}
