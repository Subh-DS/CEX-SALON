import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { Booking } from "@/types";

export interface Analytics {
  today: { appointments: number; revenue: number };
  month: { bookings: number; cancelled: number; cancellation_rate: number };
  popular_services: { name: string; bookings: number; revenue: number }[];
  revenue_7d: { day: string; revenue: number }[];
  loyalty: { issued: number; redeemed: number };
  new_customers_7d: number;
}

export interface AdminCustomer {
  id: string;
  email: string;
  phone: string | null;
  name: string;
  notes: string | null;
  bookings: number;
  points: number;
  tier: string | null;
}

export interface AdminReview {
  id: string;
  rating: number;
  stylist_rating: number | null;
  comment: string | null;
  tags: string;
  customer: string | null;
  created_at: string | null;
}

const adminKeys = ["admin"];

export function useAnalytics() {
  return useQuery({ queryKey: [...adminKeys, "analytics"], queryFn: () => apiFetch<Analytics>("/admin/analytics") });
}

export function useAdminBookings() {
  return useQuery({ queryKey: [...adminKeys, "bookings"], queryFn: () => apiFetch<Booking[]>("/bookings") });
}

export function useAdminCustomers() {
  return useQuery({ queryKey: [...adminKeys, "customers"], queryFn: () => apiFetch<AdminCustomer[]>("/admin/customers") });
}

export interface AdminReward {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  value: number;
  is_active: boolean;
}

export function useAdminRewards() {
  return useQuery({ queryKey: [...adminKeys, "rewards"], queryFn: () => apiFetch<AdminReward[]>("/admin/rewards") });
}

export function useAdminReviews() {
  return useQuery({ queryKey: [...adminKeys, "reviews"], queryFn: () => apiFetch<AdminReview[]>("/admin/reviews") });
}

export function useSaveNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notes }: { id: string; notes: string }) =>
      apiFetch(`/admin/customers/${id}/notes`, { method: "PUT", body: JSON.stringify({ notes }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: [...adminKeys, "customers"] }),
  });
}

export interface ServiceIn {
  name: string;
  description?: string;
  category: string;
  duration_minutes: number;
  price: number;
  is_active: boolean;
}

export function useSaveService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: ServiceIn & { id?: string }) =>
      apiFetch(id ? `/admin/services/${id}` : "/admin/services", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...adminKeys] });
      qc.invalidateQueries({ queryKey: ["services"] });
    },
  });
}

export interface RewardIn {
  name: string;
  description?: string;
  points_cost: number;
  is_active: boolean;
}

export function useSaveReward() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: RewardIn & { id?: string }) =>
      apiFetch(id ? `/admin/rewards/${id}` : "/admin/rewards", {
        method: id ? "PUT" : "POST",
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...adminKeys] });
      qc.invalidateQueries({ queryKey: ["rewards"] });
    },
  });
}

export interface DayHours {
  day_of_week: number;
  start_time: string;
  end_time: string;
  is_active: boolean;
}

export function useMyAvailability() {
  return useQuery({
    queryKey: ["availability", "mine"],
    queryFn: () => apiFetch<DayHours[]>("/staff/availability"),
  });
}

export function useSaveAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (days: DayHours[]) =>
      apiFetch("/staff/availability", { method: "PUT", body: JSON.stringify({ days }) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["availability"] }),
  });
}

export interface TimeBlock {
  id: string;
  start_datetime: string;
  end_datetime: string;
  reason: string | null;
}

export function useMyBlocks() {
  return useQuery({ queryKey: ["blocks", "mine"], queryFn: () => apiFetch<TimeBlock[]>("/staff/blocks") });
}

export interface StatusResult {
  id: string;
  status: string;
  points_awarded: number;
}

export function useBooking(id: string | undefined) {
  return useQuery({
    queryKey: ["booking", id],
    queryFn: () => apiFetch<Booking>(`/bookings/${id}`),
    enabled: !!id,
  });
}

export interface CustomerActivity {
  transactions: { id: string; points: number; type: string; description: string; created_at: string | null }[];
  redemptions: { id: string; reward: string; points_spent: number; code: string; status: string; created_at: string | null }[];
}

export function useCustomerActivity(customerId: string | undefined) {
  return useQuery({
    queryKey: [...adminKeys, "activity", customerId],
    queryFn: () => apiFetch<CustomerActivity>(`/admin/customers/${customerId}/activity`),
    enabled: !!customerId,
  });
}

export function useAddBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: { start_datetime: string; end_datetime: string; reason?: string }) =>
      apiFetch<{ id: string }>("/staff/blocks", { method: "POST", body: JSON.stringify(body) }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blocks"] }),
  });
}

export function useRemoveBlock() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => apiFetch(`/staff/blocks/${id}`, { method: "DELETE" }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["blocks"] }),
  });
}
