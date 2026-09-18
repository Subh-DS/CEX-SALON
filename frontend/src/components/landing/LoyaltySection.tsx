import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * Landing teaser for Glow Points — the two real earning rules beyond
 * visits (backend constants REVIEW_BONUS_POINTS / REFERRAL_BONUS_POINTS).
 * Full mechanics live on /loyalty.
 */
export default function LoyaltySection() {
  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ivory">
      <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
            Keep your glow going
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink md:text-[36px]">
            Every visit gives something back.
          </h2>
          <div className="mt-6 grid gap-6 border-t border-ink/12 pt-6 sm:grid-cols-2">
            <div>
              <p className="font-display text-3xl font-medium text-ink">50</p>
              <p className="mt-1 text-[15px] text-ink/65">points for a review after your visit</p>
            </div>
            <div>
              <p className="font-display text-3xl font-medium text-ink">200</p>
              <p className="mt-1 text-[15px] text-ink/65">when a friend you refer visits</p>
            </div>
          </div>
          <div className="mt-6">
            <Link
              to="/loyalty"
              className="font-accent text-[15px] font-semibold text-primary underline underline-offset-8 decoration-primary/40 hover:decoration-primary"
            >
              See how Glow Points work →
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
