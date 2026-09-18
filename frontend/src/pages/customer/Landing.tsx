import Hero from "@/components/landing/Hero";
import Experience from "@/components/landing/Experience";
import ServicesMenu from "@/components/landing/ServicesMenu";
import Interior from "@/components/landing/Interior";
import BookingStrip from "@/components/landing/BookingStrip";
import Experts from "@/components/landing/Experts";
import LoyaltySection from "@/components/landing/LoyaltySection";
import WelcomeBack from "@/components/landing/WelcomeBack";
import FinalCta from "@/components/landing/FinalCta";

export default function Landing() {
  // -mb-8 absorbs CustomerLayout's bottom padding so the dark CTA meets the footer.
  return (
    <div className="-mb-8">
      <Hero />
      <Experience />
      <ServicesMenu />
      <Interior />
      <BookingStrip />
      <Experts />
      <LoyaltySection />
      <WelcomeBack />
      <FinalCta />
    </div>
  );
}
