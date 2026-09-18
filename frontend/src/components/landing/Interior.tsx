import { motion } from "framer-motion";
import SmartImage from "@/components/decor/SmartImage";
import { INTERIOR_IMAGE } from "@/data/images";

export default function Interior() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ivory text-ink">
      <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-12 md:px-6 md:py-24">
        <motion.div
          className="md:col-span-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
        >
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">The space</p>
          <h2 className="mt-3 font-display text-3xl font-medium leading-tight tracking-tight md:text-[36px]">
            Come in, take your time.
          </h2>
          <p className="mt-4 max-w-sm text-[16px] leading-relaxed text-ink/70">
            Sundara is designed to feel calm from the moment you walk through
            the door — warm light, quiet chairs, no rush.
          </p>
          <p className="mt-5 font-accent text-sm text-ink/55">Patia, Bhubaneswar</p>
        </motion.div>
        <motion.div
          className="md:col-span-8"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.7, ease: "easeOut" }}
        >
          <SmartImage
            src={INTERIOR_IMAGE}
            alt="Inside the Sundara salon in Patia"
            className="aspect-[16/10] w-full rounded-[6px]"
          />
        </motion.div>
      </div>
    </section>
  );
}
