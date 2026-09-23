import { motion } from "framer-motion";

const STEPS = [
  { n: "01", title: "Visit The Blush Studio", text: "Earn 1 Glow Point for every ₹10 you spend on completed visits." },
  { n: "02", title: "Keep glowing", text: "Reviews and referrals add points too — every activity is recorded openly." },
  { n: "03", title: "Use your points", text: "Redeem rewards on future visits. Every activity is recorded openly." },
];

export default function HowItWorks() {
  return (
    <div>
      <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">How it works</p>
      <div className="mt-3 grid gap-6 sm:grid-cols-3">
        {STEPS.map((s, i) => (
          <motion.div
            key={s.n}
            initial={{ opacity: 0, y: 14 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-20px" }}
            transition={{ duration: 0.4, ease: "easeOut", delay: i * 0.05 }}
          >
            <p className="font-display text-lg text-marigold">{s.n}</p>
            <p className="mt-1 font-display text-lg font-medium text-ink">{s.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-ink/60">{s.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
