import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SmartImage from "@/components/decor/SmartImage";
import { staffImage } from "@/data/images";
import { useStaff } from "@/api/bookings";

export default function Experts() {
  // Real roster from the backend (names, ratings, specialties, tenure).
  const { data, isPending, isError } = useStaff(null);

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-ivory">
      <div className="mx-auto max-w-6xl px-4 pb-16 md:px-6 md:pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="max-w-2xl"
        >
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
            The people behind the chair
          </p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink md:text-[40px]">
            Experts you&apos;ll be happy to return to.
          </h2>
        </motion.div>

        {isPending && (
          <div className="mt-10 grid gap-10 sm:grid-cols-3 md:gap-8" aria-label="Loading experts">
            {[0, 1, 2].map((i) => (
              <div key={i} className="aspect-[3/4] animate-pulse rounded-[4px] bg-ink/8" />
            ))}
          </div>
        )}

        {isError && (
          <p role="alert" className="mt-10 text-[15px] text-ink/70">
            We couldn&apos;t load our experts right now — but they&apos;re in the salon.{" "}
            <Link to="/book" className="font-semibold text-primary underline underline-offset-4">
              Book an appointment →
            </Link>
          </p>
        )}

        {data && (
          <div className="mt-10 grid gap-10 sm:grid-cols-3 md:gap-8">
            {data.map((st, i) => (
              <motion.div
                key={st.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, ease: "easeOut", delay: i * 0.07 }}
              >
                <Link to={`/book?staff_id=${st.id}`} className="group block">
                  <SmartImage
                    src={staffImage(st)}
                    alt={`Portrait of ${st.name}`}
                    className="aspect-[3/4] w-full rounded-[4px]"
                  />
                  <p className="mt-4 font-display text-xl font-medium text-ink group-hover:underline">
                    {st.name}
                  </p>
                  <p className="mt-0.5 text-[15px] text-ink/60">{st.specialties.join(" · ")}</p>
                  <p className="mt-1 text-sm text-ink/50">★ {st.rating} · {st.experience_years} years</p>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
