import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SmartImage from "@/components/decor/SmartImage";
import { serviceImage } from "@/data/images";
import { useServices } from "@/api/bookings";
import { formatINR } from "@/lib/utils";

export default function ServicesMenu() {
  const { data, isPending, isError, refetch } = useServices();
  const [featured, ...rest] = data ?? [];

  return (
    <section className="relative left-1/2 w-screen -translate-x-1/2 bg-bone">
      <div className="mx-auto max-w-6xl px-4 py-16 md:px-6 md:py-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.55, ease: "easeOut" }}
          className="flex flex-wrap items-end justify-between gap-4"
        >
          <div>
            <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Services</p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-tight text-ink md:text-[40px]">
              Hair, skin, nails — done properly.
            </h2>
          </div>
          <Link to="/services" className="font-accent text-[15px] font-semibold text-ink underline underline-offset-8 decoration-ink/30 hover:decoration-ink">
            View all services →
          </Link>
        </motion.div>

        {isPending && (
          <div className="mt-10 grid gap-8 md:grid-cols-12 md:gap-12" aria-label="Loading services">
            <div className="aspect-[16/10] animate-pulse rounded-[6px] bg-ink/8 md:col-span-7" />
            <div className="space-y-3 md:col-span-5">
              <div className="h-7 w-2/3 animate-pulse bg-ink/8" />
              <div className="h-4 w-1/2 animate-pulse bg-ink/8" />
              <div className="h-11 w-44 animate-pulse bg-ink/8" />
            </div>
          </div>
        )}

        {isError && (
          <p role="alert" className="mt-10 text-[15px] text-ink/70">
            We couldn't load services right now.{" "}
            <button onClick={() => refetch()} className="font-semibold text-primary underline underline-offset-4">
              Try again
            </button>
          </p>
        )}

        {featured && (
          <>
            {/* Featured */}
            <motion.div
              className="mt-10 grid gap-8 md:grid-cols-12 md:gap-12"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.55, ease: "easeOut" }}
            >
              <div className="md:col-span-7">
                <SmartImage
                  src={serviceImage(featured)}
                  alt={featured.name}
                  className="aspect-[16/10] w-full rounded-[6px]"
                />
              </div>
              <div className="flex flex-col justify-center md:col-span-5">
                <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">Featured</p>
                <h3 className="mt-2 font-display text-3xl font-medium text-ink">{featured.name}</h3>
                <p className="mt-2 text-[15px] text-ink/65">
                  {featured.duration_minutes} min · {featured.description}
                </p>
                <p className="mt-3 font-display text-2xl text-ink">{formatINR(featured.price)}</p>
                <div className="mt-5">
                  <Link
                    to={`/book?service_id=${featured.id}`}
                    className="inline-flex min-h-[48px] items-center bg-primary px-7 font-accent text-sm font-semibold text-ivory hover:bg-plum-deep"
                  >
                    Book this service
                  </Link>
                </div>
              </div>
            </motion.div>

            {/* Menu rows */}
            <div className="mt-12 grid gap-x-12 md:grid-cols-2">
              {rest.map((s, i) => (
                <motion.div
                  key={s.id}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.45, ease: "easeOut", delay: (i % 2) * 0.05 }}
                >
                  <Link to={`/services/${s.id}`} className="group flex items-center gap-5 border-t border-ink/15 py-5 transition-colors hover:bg-white/60">
                    <span className="block h-[72px] w-[96px] shrink-0 overflow-hidden rounded-[4px]">
                      <SmartImage
                        src={serviceImage(s)}
                        alt={`${s.name} at The Blush Studio`}
                        className="h-full w-full"
                        imgClassName="transition-transform duration-300 ease-out group-hover:scale-[1.04]"
                      />
                    </span>
                    <span className="flex-1">
                      <b className="font-display text-lg font-medium text-ink group-hover:underline">{s.name}</b>
                      <br />
                      <small className="text-sm text-ink/60">{s.duration_minutes} min · {s.description}</small>
                    </span>
                    <b className="whitespace-nowrap font-accent text-[15px] text-ink">{formatINR(s.price)}</b>
                    <span aria-hidden="true" className="font-accent text-ink/40 transition-transform duration-300 ease-out group-hover:translate-x-1 group-hover:text-ink">→</span>
                  </Link>
                </motion.div>
              ))}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
