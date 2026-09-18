import { Link, useParams } from "react-router-dom";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import SmartImage from "@/components/decor/SmartImage";
import { serviceImage, staffImage } from "@/data/images";
import { useServices, useStaff } from "@/api/bookings";
import { formatINR } from "@/lib/utils";

export default function ServiceDetail() {
  const { id } = useParams();
  const { data: services, isPending, isError } = useServices();
  const service = services?.find((s) => s.id === id);
  const { data: staffList } = useStaff(service?.id);

  if (isPending) {
    return (
      <div className="grid gap-6 md:grid-cols-2" aria-label="Loading service">
        <div className="h-64 animate-pulse rounded-md2 bg-ink/8" />
        <div className="h-64 animate-pulse rounded-md2 bg-ink/8" />
      </div>
    );
  }

  if (isError || !service) {
    return (
      <Card>
        <h1 className="font-display text-2xl text-ink">
          {isError ? "We couldn't load this service." : "This service doesn't exist."}
        </h1>
        <p className="mt-2 text-ink/65">
          {isError ? "Please try again in a moment." : "It may have been removed from the menu."}
        </p>
        <div className="mt-4 flex gap-3">
          <Link to="/services">
            <Button variant="secondary">Back to services</Button>
          </Link>
          <Link to="/book">
            <Button>Book an appointment</Button>
          </Link>
        </div>
      </Card>
    );
  }

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card className="!p-0 overflow-hidden">
        <SmartImage src={serviceImage(service)} alt={service.name} className="aspect-[16/10]" />
        <div className="p-6">
          <p className="font-accent text-xs font-semibold uppercase tracking-wide text-mutedbrown">
            {service.category} · {service.duration_minutes} min
          </p>
          <h1 className="mt-1 font-display text-3xl text-ink">{service.name}</h1>
          <p className="mt-2 text-mutedbrown">{service.description}</p>
          <p className="mt-4 text-2xl font-bold text-ink">{formatINR(service.price)}</p>
          <div className="mt-4">
            <Link to={`/book?service_id=${service.id}`}>
              <Button>Book This Service</Button>
            </Link>
          </div>
        </div>
      </Card>
      <Card>
        <h2 className="font-display text-xl text-ink">Experts offering this</h2>
        <div className="mt-3 space-y-3">
          {(staffList ?? []).map((st) => (
            <div key={st.id} className="flex items-center justify-between gap-3 border-b border-warmborder pb-3">
              <div className="flex items-center gap-3">
                <img src={staffImage(st)} alt="" className="h-11 w-11 rounded-full object-cover" loading="lazy" />
                <div>
                  <p className="font-semibold text-ink">{st.name}</p>
                  <p className="text-sm text-mutedbrown">
                    ★ {st.rating} · {st.experience_years} yrs
                  </p>
                </div>
              </div>
              <Link to={`/book?service_id=${service.id}&staff_id=${st.id}`}>
                <Button variant="secondary">Choose</Button>
              </Link>
            </div>
          ))}
          {staffList?.length === 0 && (
            <p className="text-sm text-mutedbrown">No experts listed for this service right now.</p>
          )}
        </div>
      </Card>
    </div>
  );
}
