import { Link } from "react-router-dom";
import { motion } from "framer-motion";

export default function FinalCta() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-plum text-ivory">
      <div className="mx-auto max-w-6xl px-4 py-20 text-center md:px-6 md:py-28">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="font-devanagari text-lg text-ivory/55">पधारिए</p>
          <h2 className="mx-auto mt-3 max-w-2xl font-display text-[clamp(1.9rem,4vw,2.75rem)] font-medium leading-tight tracking-tight">
            Your next appointment is closer than you think.
          </h2>
          <div className="mt-8">
            <Link
              to="/book"
              className="inline-flex min-h-[52px] items-center bg-ivory px-9 font-accent text-[15px] font-semibold text-ink transition-colors hover:bg-white"
            >
              Book an appointment
            </Link>
          </div>
          <p className="mt-5 text-sm text-ivory/55">Mon–Sat · 9 AM – 7 PM · Patia, Bhubaneswar</p>
        </motion.div>
      </div>
    </section>
  );
}
