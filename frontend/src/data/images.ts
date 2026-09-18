/** Maps catalog entries to /images/*.jpg files (user-supplied photography). */
export const SERVICE_IMAGES: Record<string, string> = {
  s1: "/images/service-hairspa.jpg",
  s2: "/images/service-haircut.jpg",
  s3: "/images/service-color.jpg",
  s4: "/images/service-facial.jpg",
  s5: "/images/service-cleanup.jpg",
  s6: "/images/service-nails.jpg",
};

export const STAFF_IMAGES: Record<string, string> = {
  st1: "/images/staff-ananya.jpg",
  st2: "/images/staff-kabir.jpg",
  st3: "/images/staff-divya.jpg",
};

export const HERO_IMAGE = "/images/hero-salon.jpg";
export const INTERIOR_IMAGE = "/images/salon-interior.jpg";

const SERVICE_IMAGES_BY_NAME: Record<string, string> = {
  "Hair Spa Ritual": "/images/service-hairspa.jpg",
  "Classic Haircut": "/images/service-haircut.jpg",
  "Hair Coloring": "/images/service-color.jpg",
  "Signature Facial": "/images/service-facial.jpg",
  "Cleanup Express": "/images/service-cleanup.jpg",
  "Manicure + Pedicure": "/images/service-nails.jpg",
};

const STAFF_IMAGES_BY_NAME: Record<string, string> = {
  "Ananya Sharma": "/images/staff-ananya.jpg",
  "Kabir Menon": "/images/staff-kabir.jpg",
  "Divya Patnaik": "/images/staff-divya.jpg",
};

/** Image lookup that works for mock IDs and real API UUIDs (matched by name). */
export function serviceImage(service: { id: string; name: string }): string {
  return SERVICE_IMAGES[service.id] ?? SERVICE_IMAGES_BY_NAME[service.name] ?? "";
}

export function staffImage(staff: { id: string; name: string }): string {
  return STAFF_IMAGES[staff.id] ?? STAFF_IMAGES_BY_NAME[staff.name] ?? "";
}
