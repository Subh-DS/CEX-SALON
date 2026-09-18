import { useState } from "react";
import { Link } from "react-router-dom";
import SectionHeading from "@/components/common/SectionHeading";
import SmartImage from "@/components/decor/SmartImage";
import Card from "@/components/ui/Card";
import { serviceImage } from "@/data/images";
import { useServices } from "@/api/bookings";
import { formatINR } from "@/lib/utils";

const CATEGORIES = ["All", "Hair", "Skin", "Nails"];

export default function Services() {
  const [cat, setCat] = useState("All");
  const { data, isPending, isError, refetch } = useServices();
  const list = (data ?? []).filter((s) => cat === "All" || s.category === cat);

  return (
    <div>
      <SectionHeading
        eyebrow="Our menu"
        title="Choose your ritual"
        sub="Honest prices, real durations. Every service earns Glow points."
      />
      <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCat(c)}
            aria-pressed={cat === c}
            className={`min-h-[44px] rounded-pill border px-5 font-accent text-sm font-semibold ${
              cat === c ? "border-primary bg-primary text-white" : "border-warmborder bg-white"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {isPending && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-label="Loading services">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-72 animate-pulse rounded-md2 bg-ink/8" />
          ))}
        </div>
      )}

      {isError && (
        <p role="alert" className="mt-6 text-[15px] text-ink/70">
          We couldn't load services right now.{" "}
          <button onClick={() => refetch()} className="font-semibold text-primary underline underline-offset-4">
            Try again
          </button>
        </p>
      )}

      {data && list.length === 0 && (
        <p className="mt-6 text-[15px] text-ink/70">No services in this category right now.</p>
      )}

      {data && (
        <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {list.map((s) => (
            <Link key={s.id} to={`/services/${s.id}`} className="group" data-testid="service-card">
              <Card className="!p-0 overflow-hidden transition-shadow group-hover:shadow-md2">
                <SmartImage src={serviceImage(s)} alt={s.name} className="aspect-[16/10]" />
                <div className="p-5">
                  <p className="font-accent text-xs font-semibold uppercase tracking-wide text-marigold-deep">
                    {s.category} · {s.duration_minutes} min
                  </p>
                  <p className="mt-1 font-display text-xl text-ink">{s.name}</p>
                  <p className="mt-1 text-sm text-mutedbrown">{s.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <b className="text-ink">{formatINR(s.price)}</b>
                    <span className="font-accent text-sm font-semibold text-primary group-hover:underline">
                      Details →
                    </span>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
