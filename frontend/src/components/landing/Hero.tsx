import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SmartImage from "@/components/decor/SmartImage";
import { HERO_IMAGE } from "@/data/images";

export default function Hero() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ivory">
      <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 pb-14 pt-10 md:grid-cols-12 md:gap-10 md:px-6 md:pb-24 md:pt-20">
        <motion.div
          className="md:col-span-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Bhubaneswar · Patia
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.75rem,6vw,4rem)] font-medium leading-[1.08] tracking-tight text-ink">
            Beauty, on
            <br />
            your time.
          </h1>
          <p className="mt-5 max-w-md text-[17px] leading-relaxed text-ink/70">
            Thoughtfully chosen services, trusted experts, and a booking
            experience that fits around you.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              to="/book"
              className="inline-flex min-h-[52px] items-center bg-primary px-8 font-accent text-[15px] font-semibold text-ivory transition-colors hover:bg-plum-deep"
            >
              Book an appointment
            </Link>
            <Link
              to="/services"
              className="inline-flex min-h-[52px] items-center border-b-2 border-ink/25 px-1 font-accent text-[15px] font-semibold text-ink transition-colors hover:border-ink"
            >
              Explore services
            </Link>
          </div>
          <p className="mt-8 text-sm text-ink/55">
            Trusted experts · Open Mon–Sat till 7 PM
          </p>
        </motion.div>
        <motion.div
          className="md:col-span-7"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
        >
          <SmartImage
            src={HERO_IMAGE}
            alt="Guest with fresh styling at Sundara, Patia"
            eager
            className="aspect-[16/10] w-full rounded-[6px] md:aspect-[16/10]"
          />
        </motion.div>
      </div>
    </section>
  );
}
