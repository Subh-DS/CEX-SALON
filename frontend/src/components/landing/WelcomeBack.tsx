import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { useMyBookings } from "@/api/bookings";

/** Quiet personal touch for signed-in guests with visit history. */
export default function WelcomeBack() {
  const { user } = useAuth();
  const { data } = useMyBookings();

  if (!user || user.role !== "customer" || !data || data.length === 0) return null;
  const last = data.find((b) => b.items.length > 0);
  if (!last) return null;
  const item = last.items[0];

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 border-y border-ink/15 bg-ivory">
      <motion.div
        className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-8 md:px-6"
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <div>
          <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Good to see you again</p>
          <p className="mt-1 font-display text-xl font-medium text-ink">
            Your usual {item.service_name} with {item.staff_name}?
          </p>
        </div>
        <Link
          to="/book"
          className="inline-flex min-h-[48px] items-center border border-ink px-7 font-accent text-sm font-semibold text-ink hover:bg-primary hover:text-ivory"
        >
          Book again
        </Link>
      </motion.div>
    </section>
  );
}
