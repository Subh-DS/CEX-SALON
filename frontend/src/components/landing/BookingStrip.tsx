import { Link } from "react-router-dom";
import { motion } from "framer-motion";

const STEPS = ["Choose your service", "See real availability", "Pick your expert", "Book"];

export default function BookingStrip() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ivory">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Booking, without the back-and-forth
          </p>
          <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-2 font-display text-2xl font-medium text-ink md:text-[28px]">
            {STEPS.map((s, i) => (
              <span key={s} className="inline-flex items-center gap-3">
                {i > 0 && <span className="text-marigold" aria-hidden="true">→</span>}
                <span className={i === STEPS.length - 1 ? "underline decoration-marigold/70 underline-offset-8" : ""}>
                  {s}
                </span>
              </span>
            ))}
          </div>
          <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-ink/65">
            No phone calls. No waiting for confirmation. No guessing whether
            your stylist is free.
          </p>
          <div className="mt-6">
            <Link
              to="/book"
              className="inline-flex min-h-[52px] items-center bg-primary px-8 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep"
            >
              Book an appointment
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
