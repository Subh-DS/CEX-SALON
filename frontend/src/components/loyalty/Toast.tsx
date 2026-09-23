import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";

export interface ToastMsg {
  id: number;
  text: string;
  tone: "success" | "warn";
}

/** Small toast stack for minor loyalty events — aria-live, auto-dismissing. */
export function ToastStack({
  toasts,
  onDone,
}: {
  toasts: ToastMsg[];
  onDone: (id: number) => void;
}) {
  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-5 z-[60] flex flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onDone={onDone} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastItem({ toast, onDone }: { toast: ToastMsg; onDone: (id: number) => void }) {
  useEffect(() => {
    const timer = window.setTimeout(() => onDone(toast.id), 3400);
    return () => window.clearTimeout(timer);
  }, [toast.id, onDone]);

  return (
    <motion.p
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 6 }}
      transition={{ duration: 0.25 }}
      className={`pointer-events-auto rounded-pill px-5 py-2.5 font-accent text-sm font-semibold shadow-md2 ${
        toast.tone === "success" ? "bg-ink text-ivory" : "bg-[#f7e8e8] text-[#8f2f2f]"
      }`}
    >
      {toast.text}
    </motion.p>
  );
}
