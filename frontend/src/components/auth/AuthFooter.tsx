/** Compact footer for authentication pages — quiet, no marketing columns. */
export default function AuthFooter() {
  return (
    <footer className="border-t border-ink/10 bg-ivory">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-6 font-accent text-[13px] text-ink/55 md:flex-row md:items-center md:justify-between md:px-6">
        <p>
          <span className="font-display text-base font-semibold text-ink">Sundara</span>{" "}
          <span className="font-devanagari text-sm">सुन्दरा</span>
          <span className="ml-3">Bhubaneswar · Patia</span>
        </p>
        <p className="flex gap-5">
          <span>Privacy</span>
          <span>Terms</span>
          <span>Contact</span>
        </p>
      </div>
    </footer>
  );
}
