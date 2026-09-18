import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "./client";
import type { LoyaltyAccount, ReviewRef } from "@/types";

export interface LoyaltyTransaction {
  id: string;
  points: number;
  type: string;
  description: string;
  reference_type: string;
  reference_id: string;
  created_at: string;
}

export function useLoyaltyAccount() {
  return useQuery({
    queryKey: ["loyalty-account"],
    queryFn: async () => {
      const raw = await apiFetch<{
        points_balance: number;
        tier: LoyaltyAccount["tier"];
        tier_points: number;
        next_tier_at: number;
        total_earned: number;
        total_redeemed: number;
      }>("/loyalty/account");
      const mapped: LoyaltyAccount = {
        pointsBalance: raw.points_balance,
        tier: raw.tier,
        tierPoints: raw.tier_points,
        nextTierAt: raw.next_tier_at,
        totalEarned: raw.total_earned,
        totalRedeemed: raw.total_redeemed,
      };
      return mapped;
    },
    retry: false,
  });
}

export function useLoyaltyTransactions() {
  return useQuery({
    queryKey: ["loyalty-transactions"],
    queryFn: () => apiFetch<LoyaltyTransaction[]>("/loyalty/transactions"),
    retry: false,
  });
}

export function useMyReviews() {
  return useQuery({
    queryKey: ["my-reviews"],
    queryFn: () => apiFetch<ReviewRef[]>("/reviews/me"),
  });
}

export interface Tier {
  name: string;
  min_points: number;
  benefits: string[];
}

export interface RewardFull {
  id: string;
  name: string;
  description: string | null;
  points_cost: number;
  value: number;
}

export interface RedeemResult {
  code: string;
  reward_name: string;
  points_spent: number;
  points_balance: number;
}

export function useTiers() {
  return useQuery({
    queryKey: ["loyalty-tiers"],
    queryFn: () => apiFetch<Tier[]>("/loyalty/tiers"),
  });
}

export function useRewards() {
  return useQuery({
    queryKey: ["loyalty-rewards"],
    queryFn: () => apiFetch<RewardFull[]>("/loyalty/rewards"),
  });
}

export function useRedeem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rewardId: string) =>
      apiFetch<RedeemResult>(`/loyalty/rewards/${rewardId}/redeem`, { method: "POST" }),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ["loyalty-account"] });
      qc.invalidateQueries({ queryKey: ["loyalty-transactions"] });
      qc.setQueryData(["loyalty-account"], (old: LoyaltyAccount | undefined) =>
        old ? { ...old, pointsBalance: data.points_balance } : old
      );
    },
  });
}

export function useSubmitReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { booking_id: string; rating: number; comment?: string }) =>
      apiFetch<{ id: string; points_awarded: number }>("/reviews", {
        method: "POST",
        body: JSON.stringify(input),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["my-reviews"] });
      qc.invalidateQueries({ queryKey: ["loyalty"] });
      qc.invalidateQueries({ queryKey: ["bookings"] });
    },
  });
}
