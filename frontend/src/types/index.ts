export type Role = "customer" | "staff" | "admin";

export interface Service {
  id: string;
  name: string;
  description: string;
  duration_minutes: number;
  price: number;
  category: string;
  imageUrl?: string;
}

export interface Staff {
  id: string;
  name: string;
  rating: number;
  review_count: number;
  specialties: string[];
  experience_years: number;
}

export interface TimeSlot {
  time: string;
  available: boolean;
}

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export interface BookingItem {
  id: string;
  service_id: string;
  service_name: string;
  staff_id: string;
  staff_name: string;
  start_time: string;
  end_time: string;
  price: number;
  status: BookingStatus;
  duration_minutes: number;
}

export interface StatusHistoryEntry {
  status: string;
  reason: string | null;
  created_at: string | null;
}

export interface Booking {
  id: string;
  booking_number: string;
  status: BookingStatus;
  total_amount: number;
  notes: string | null;
  items: BookingItem[];
  branch_name: string | null;
  paid: boolean;
  customer_id?: string;
  customer_name?: string;
  customer_phone?: string | null;
  customer_notes?: string | null;
  status_history?: StatusHistoryEntry[];
  discount_amount?: number;
  coupon_code?: string | null;
}

export interface ReviewRef {
  booking_id: string;
  rating: number;
}

export interface LoyaltyAccount {
  pointsBalance: number;
  tier: "Seed" | "Bloom" | "Flourish" | "Radiance";
  tierPoints: number;
  nextTierAt: number;
  totalEarned: number;
  totalRedeemed: number;
}
