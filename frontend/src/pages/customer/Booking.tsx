import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Stepper, { STEP_HEADINGS } from "@/components/booking/Stepper";
import StepService from "@/components/booking/StepService";
import StepStaff from "@/components/booking/StepStaff";
import StepDate, { defaultDateISO } from "@/components/booking/StepDate";
import StepTime from "@/components/booking/StepTime";
import StepReview from "@/components/booking/StepReview";
import StepPayment from "@/components/booking/StepPayment";
import BookingConfirmed from "@/components/booking/BookingConfirmed";
import SummaryPanel from "@/components/booking/SummaryPanel";
import { MobileBar, MobileStepHead } from "@/components/booking/MobileBar";
import SmartImage from "@/components/decor/SmartImage";
import { HERO_IMAGE, SERVICE_IMAGES } from "@/data/images";
import { useCreateBooking, useServices, useStaff } from "@/api/bookings";
import type { Booking } from "@/types";

function friendlyCreateError(err: unknown): string {
  const code = (err as { code?: string }).code;
  if (code === "BOOKING_CONFLICT") return "conflict";
  if (code === "HTTP_401") return "Your session expired. Please log in again — your selections are kept in this flow.";
  return (err as { message?: string }).message ?? "Something went wrong while confirming your appointment. Your booking has not been confirmed.";
}

export default function Booking() {
  const [params] = useSearchParams();
  const rebook = params.get("service_id") && params.get("staff_id");
  const [step, setStep] = useState(rebook ? 2 : 0);
  const [serviceId, setServiceId] = useState<string | null>(params.get("service_id"));
  const [staffId, setStaffId] = useState<string | null>(params.get("staff_id"));
  const [date, setDate] = useState(defaultDateISO());
  const [slot, setSlot] = useState<string | null>(null);
  const [booking, setBooking] = useState<Booking | null>(null);
  const [confirmed, setConfirmed] = useState<Booking | null>(null);
  const [problem, setProblem] = useState<string | null>(null);

  const { data: services } = useServices();
  const { data: staffList } = useStaff(serviceId);
  const create = useCreateBooking();

  const service = services?.find((s) => s.id === serviceId);
  const staff = staffList?.find((s) => s.id === staffId);

  // A reservation already exists — changing any selection invalidates it so
  // continuing again can't silently double-book.
  useEffect(() => {
    if (!booking) return;
    const item = booking.items[0];
    const sameSlot = !!slot && !!item && item.start_time.startsWith(`${date}T${slot}`);
    if (!item || item.service_id !== serviceId || item.staff_id !== staffId || !sameSlot) {
      setBooking(null);
    }
  }, [booking, serviceId, staffId, date, slot]);

  // Keep a deep-linked expert when possible; clear with notice if they
  // don't offer the newly chosen service.
  useEffect(() => {
    if (!staffId || !staffList) return;
    if (!staffList.some((s) => s.id === staffId)) {
      setStaffId(null);
      setProblem("Your previously chosen expert doesn't offer this service — please pick another.");
    }
  }, [staffList, staffId]);

  const canNext =
    (step === 0 && !!serviceId) ||
    (step === 1 && !!staffId) ||
    (step === 2 && !!date) ||
    (step === 3 && !!slot) ||
    step === 4;

  const nextLabel = step === 4 ? "Reserve & continue" : "Continue";

  async function next() {
    setProblem(null);
    if (step < 4) {
      setStep((s) => s + 1);
      return;
    }
    if (!serviceId || !staffId || !slot || !date) return;
    if (booking) {
      // Reservation from this flow still matches the selections — reuse it.
      setStep(5);
      return;
    }
    try {
      const created = await create.mutateAsync({
        items: [{ service_id: serviceId, staff_id: staffId, start_time: `${date}T${slot}:00+00:00` }],
      });
      setBooking(created);
      setStep(5);
    } catch (err) {
      const msg = friendlyCreateError(err);
      if (msg === "conflict") {
        setProblem("That time was just taken. Please choose another slot.");
        setStep(3);
      } else {
        setProblem(msg);
      }
    }
  }

  function back() {
    setProblem(null);
    setStep((s) => Math.max(0, s - 1));
  }

  if (confirmed) {
    return (
      <div className="relative left-1/2 -my-8 w-screen -translate-x-1/2 bg-ivory">
        <div className="mx-auto max-w-6xl px-4 py-14 md:px-6 md:py-20">
          <BookingConfirmed booking={confirmed} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative left-1/2 -my-8 w-screen -translate-x-1/2 bg-ivory">
      <div className="mx-auto max-w-[1280px] px-4 py-10 md:px-6 md:py-14">
        <p className="font-accent text-xs font-bold uppercase tracking-[0.2em] text-primary">
          Book an appointment
        </p>
        <h1 className="mt-2 font-display text-[32px] font-medium tracking-tight text-ink md:text-[40px]">
          Let's find the right time for you.
        </h1>

        <div className="mt-8 hidden lg:block">
          <Stepper current={Math.min(step, 5)} />
        </div>

        <div className="mt-6 grid gap-10 lg:mt-10 lg:grid-cols-12">
          {/* Brand + summary rail */}
          <div className="hidden lg:col-span-4 lg:block">
            <div className="sticky top-24 space-y-6">
              <SmartImage
                src={(serviceId && SERVICE_IMAGES[serviceId]) || HERO_IMAGE}
                alt={service ? service.name : "Inside The Blush Studio"}
                className="aspect-[4/3] w-full"
              />
              <p className="font-display text-xl italic text-ink/70">
                “Take a little time for yourself.”
              </p>
              <SummaryPanel service={service} staff={staff} date={date} slot={slot} />
            </div>
          </div>

          {/* Flow */}
          <div className="lg:col-span-8">
            <MobileStepHead step={Math.min(step, 5)} />
            <p className="mb-4 hidden font-accent text-[13px] font-bold uppercase tracking-[0.14em] text-ink/55 lg:block">
              Step {Math.min(step, 5) + 1} of 6 · {STEP_HEADINGS[Math.min(step, 5)]}
            </p>

            {problem && (
              <p role="alert" className="mb-4 bg-[#f7e8e8] px-4 py-3 text-sm text-[#b84444]">
                {problem}
                {problem.startsWith("Your session") && (
                  <>
                    {" "}
                    <Link to="/login" className="font-semibold underline underline-offset-4">
                      Log in
                    </Link>
                  </>
                )}
              </p>
            )}

            {step === 0 && <StepService selected={serviceId} onSelect={(id) => { setServiceId(id); }} />}
            {step === 1 && serviceId && (
              <StepStaff serviceId={serviceId} serviceName={service?.name} selected={staffId} onSelect={setStaffId} />
            )}
            {step === 2 && <StepDate date={date} setDate={(d) => { setDate(d); setSlot(null); }} />}
            {step === 3 && staffId && serviceId && (
              <StepTime
                staffId={staffId}
                serviceId={serviceId}
                staffName={staff?.name}
                date={date}
                slot={slot}
                setSlot={setSlot}
                onBackToDate={() => setStep(2)}
              />
            )}
            {step === 4 && (
              <StepReview service={service} staff={staff} date={date} slot={slot} onEdit={setStep} />
            )}
            {step === 5 && (
              <StepPayment
                bookingId={booking?.id ?? null}
                bookingNumber={booking?.booking_number ?? null}
                service={service}
                staff={staff}
                date={date}
                slot={slot}
                onPaid={(info) =>
                  setConfirmed(booking ? { ...booking, booking_number: info.booking_number ?? booking.booking_number } : null)
                }
              />
            )}

            {step < 5 && (
              <div className="mt-8 hidden items-center justify-between gap-4 lg:flex">
                {step === 0 ? (
                  <Link
                    to="/services"
                    className="inline-flex min-h-[52px] items-center font-accent text-[15px] font-semibold text-ink/70 hover:text-ink"
                  >
                    ← All services
                  </Link>
                ) : (
                  <button
                    onClick={back}
                    className="inline-flex min-h-[52px] items-center border border-ink/25 px-7 font-accent text-[15px] font-semibold text-ink hover:border-ink"
                  >
                    ← Back
                  </button>
                )}
                <button
                  onClick={next}
                  disabled={!canNext || create.isPending}
                  className="inline-flex min-h-[52px] items-center bg-primary px-9 font-accent text-[15px] font-semibold text-ivory hover:bg-plum-deep disabled:opacity-40"
                >
                  {create.isPending ? "Reserving…" : `${nextLabel} →`}
                </button>
              </div>
            )}
            {step === 5 && (
              <div className="mt-8 hidden lg:block">
                <button
                  onClick={() => setStep(4)}
                  className="inline-flex min-h-[52px] items-center border border-ink/25 px-7 font-accent text-[15px] font-semibold text-ink hover:border-ink"
                >
                  ← Back to review
                </button>
              </div>
            )}

            {/* Mobile bottom offset for sticky bar */}
            <div className="h-24 lg:hidden" aria-hidden="true" />
          </div>
        </div>
      </div>

      {step < 5 && !confirmed && (
        <MobileBar
          total={service?.price ?? null}
          canNext={canNext}
          busy={create.isPending}
          nextLabel={create.isPending ? "Reserving…" : nextLabel}
          onNext={next}
        />
      )}
    </div>
  );
}
