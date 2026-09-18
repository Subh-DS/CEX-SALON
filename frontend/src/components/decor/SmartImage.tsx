import { useState } from "react";
import Mandala from "./Mandala";
import { cn } from "@/lib/utils";

/**
 * Image with graceful fallback: if /images/*.jpg isn't provided yet,
 * renders a warm gradient + mandala placeholder instead of a broken icon.
 */
export default function SmartImage({
  src,
  alt,
  label,
  className,
  imgClassName,
  eager = false,
}: {
  src: string;
  alt: string;
  label?: string;
  className?: string;
  imgClassName?: string;
  eager?: boolean;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gradient-to-br from-[#f5e2d9] via-[#e7c6b8] to-[#c08e7e]",
        className
      )}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading={eager ? "eager" : "lazy"}
          fetchPriority={eager ? "high" : "auto"}
          onError={() => setFailed(true)}
          className={cn("h-full w-full object-cover", imgClassName)}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center">
          <Mandala size={220} className="text-marigold-deep/25" />
          {label && (
            <small className="absolute bottom-4 left-4 rounded-pill bg-black/35 px-3 py-1.5 text-xs text-white">
              {label}
            </small>
          )}
        </div>
      )}
    </div>
  );
}
