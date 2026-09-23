import { motion } from "framer-motion";

const PRINCIPLES = [
  {
    n: "01",
    title: "Choose what you need.",
    text: "Six services, honest prices, real durations. Nothing padded, nothing hidden.",
  },
  {
    n: "02",
    title: "Choose who you trust.",
    text: "Pick your expert by craft and rating — then see when they're actually free.",
  },
  {
    n: "03",
    title: "We'll take care of the rest.",
    text: "Confirmation, reminders, Glow Points. Just show up and be looked after.",
  },
];

export default function Experience() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ivory">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
            The Blush Studio experience
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight text-ink md:text-[40px]">
            A better way to book your beauty time.
          </h2>
        </motion.div>
        <div className="mt-10 border-t border-ink/15">
          {PRINCIPLES.map((p, i) => (
            <motion.div
              key={p.n}
              className="grid gap-2 border-b border-ink/15 py-7 md:grid-cols-12 md:gap-6"
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.06 }}
            >
              <span className="font-accent text-sm font-semibold text-primary md:col-span-1">{p.n}</span>
              <h3 className="font-display text-[22px] font-medium text-ink md:col-span-4">{p.title}</h3>
              <p className="text-[16px] leading-relaxed text-ink/65 md:col-span-6 md:col-start-7">{p.text}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
