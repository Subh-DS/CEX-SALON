import Button from "../ui/Button";

export default function EmptyState({
  title,
  actionLabel,
  actionTo,
}: {
  title: string;
  actionLabel: string;
  actionTo: string;
}) {
  return (
    <div className="rounded-md2 border border-dashed border-warmborder bg-white px-6 py-12 text-center">
      <p className="font-display text-xl">{title}</p>
      <a href={actionTo} className="mt-4 inline-block">
        <Button>{actionLabel}</Button>
      </a>
    </div>
  );
}
