"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
// TODO: Add RSVP handling (maybe a separate component or modal)

export default function Home() {
  const router = useRouter();
  const [isWeddingSite, setIsWeddingSite] = useState(false);

  // useEffect(() => {
  //   // Check if the current URL has a subdomain
  //   const hostname = window.location.hostname;
  //   const hasSubdomain = hostname.split(".").length > 2;

  //   if (!hasSubdomain) {
  //     // If no subdomain, redirect to landing page
  //     router.push("/landing");
  //   } else {
  //     setIsWeddingSite(true);
  //   }
  // }, [router]);

  // if (!isWeddingSite) {
    // return null; // Return null while checking subdomain
  // }

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow pt-0">
        <HeroSection />
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
