import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { fadeUp } from "./anim";

const ITEMS = [
  {
    icon: "✦",
    title: "Book a visit",
    text: "1 Glow Point for every ₹10 you spend on completed visits.",
    cta: "Book now",
    to: "/book",
  },
  {
    icon: "★",
    title: "Leave a review",
    text: "+50 bonus points when you review a completed visit.",
    cta: "Review a visit",
    to: "/dashboard",
  },
  {
    icon: "♥",
    title: "Refer a friend",
    text: "+200 points when a friend books their first visit.",
    cta: null as string | null,
    to: "",
  },
];

/** Honest earn rules — matches the backend loyalty service. */
export default function EarnPoints({ onNotify }: { onNotify?: (text: string) => void }) {
  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Ways to earn</p>
      <h2 className="mt-2 font-display text-[28px] font-medium tracking-tight text-ink">
        Small rituals, steady glow.
      </h2>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        {ITEMS.map((it, i) => (
          <motion.div
            key={it.title}
            variants={fadeUp}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-20px" }}
            className="group rounded-md2 border border-warmborder bg-white p-5 shadow-sm2 transition-all hover:-translate-y-[3px] hover:shadow-md2 active:translate-y-0"
          >
            <p aria-hidden className="font-display text-2xl text-marigold transition-transform group-hover:-translate-y-0.5">
              {it.icon}
            </p>
            <p className="mt-2 font-display text-lg font-medium text-ink">{it.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/60">{it.text}</p>
            {it.cta ? (
              <Link
                to={it.to}
                className="mt-3 inline-block font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                {it.cta} →
              </Link>
            ) : (
              <button
                onClick={() => onNotify?.("Referral codes launch soon — +200 points when a friend books their first visit.")}
                className="mt-3 inline-block font-accent text-sm font-semibold text-primary underline-offset-4 hover:underline"
              >
                How it works →
              </button>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
