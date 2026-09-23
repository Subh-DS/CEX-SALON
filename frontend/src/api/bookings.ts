import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Booking, Service, Staff, TimeSlot } from "@/types";

export function useServices(category?: string) {
  return useQuery({
    queryKey: ["services", category ?? "all"],
    queryFn: () =>
      apiFetch<Service[]>(`/services${category && category !== "All" ? `?category=${category}` : ""}`),
  });
}

export function useStaff(serviceId?: string | null) {
  return useQuery({
    queryKey: ["staff", serviceId ?? "all"],
    queryFn: () => apiFetch<Staff[]>(`/staff${serviceId ? `?service_id=${serviceId}` : ""}`),
    enabled: serviceId !== undefined,
  });
}

export interface Availability {
  date: string;
  slots: TimeSlot[];
}

export function useAvailability(staffId: string | null, date: string, serviceId: string | null) {
  return useQuery({
    queryKey: ["availability", staffId, date, serviceId],
    queryFn: () =>
      apiFetch<Availability>(
        `/availability?staff_id=${staffId}&date=${date}&service_id=${serviceId}`
      ),
    enabled: !!staffId && !!date && !!serviceId,
  });
}

export interface CreateBookingInput {
  notes?: string;
  items: { service_id: string; staff_id: string; start_time: string }[];
}

export function useCreateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: CreateBookingInput) =>
      apiFetch<Booking>("/bookings", { method: "POST", body: JSON.stringify(input) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useMyBookings() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: () => apiFetch<Booking[]>("/bookings"),
  });
}

export function useCancelBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch<Booking>(`/bookings/${id}/cancel`, { method: "POST" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export interface PayResult {
  booking_id: string;
  booking_number: string;
  status: string;
  amount: number;
  discount: number;
  coupon_code: string | null;
}

export function usePayBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ booking_id, coupon_code }: { booking_id: string; coupon_code?: string }) =>
      apiFetch<PayResult>("/payments", {
        method: "POST",
        body: JSON.stringify({ booking_id, coupon_code: coupon_code ?? undefined }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useReschedule() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { booking_id: string; items: { item_id: string; start_time: string }[] }) =>
      apiFetch<{ id: string; status: string }>(`/bookings/${input.booking_id}/reschedule`, {
        method: "POST",
        body: JSON.stringify({ items: input.items }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["bookings"] }),
  });
}

export function useSetStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { booking_id: string; status: string }) =>
      apiFetch<{ id: string; status: string; points_awarded: number }>(`/bookings/${input.booking_id}/status`, {
        method: "POST",
        body: JSON.stringify({ status: input.status }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["bookings"] });
      qc.invalidateQueries({ queryKey: ["booking"] });
    },
  });
}
