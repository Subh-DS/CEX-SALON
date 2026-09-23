import { motion } from "framer-motion";
import SmartImage from "../decor/SmartImage";
import BrandLogo from "../common/BrandLogo";
import { INTERIOR_IMAGE } from "@/data/images";

/** Editorial brand panel: atmospheric salon photography, quiet wordmark overlay. */
export default function AuthBrandPanel() {
  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-plum lg:min-h-full">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <SmartImage
          src={INTERIOR_IMAGE}
          alt="Inside The Blush Studio in Patia"
          className="h-full w-full"
        />
      </motion.div>
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-plum/80 via-plum/25 to-transparent p-8 pt-24 md:p-10"
        aria-hidden="false"
      >
        <BrandLogo variant="light" size="md" className="items-start" />
        <p className="mt-3 max-w-xs font-display text-xl italic leading-snug text-ivory/90">
          “Take a little time for yourself.”
        </p>
      </div>
    </div>
  );
}
