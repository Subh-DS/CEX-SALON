import { cn } from "@/lib/utils";

export default function Card({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "rounded-md2 border border-warmborder bg-white p-5 shadow-sm2",
        className
      )}
    >
      {children}
    </div>
  );
}
