/** Bilingual section heading: marigold eyebrow + Devanagari accent + display title. */
export default function SectionHeading({
  eyebrow,
  devanagari,
  title,
  sub,
}: {
  eyebrow: string;
  devanagari?: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="max-w-2xl">
      <p className="font-accent text-xs font-bold uppercase tracking-[0.16em] text-marigold-deep">
        {eyebrow}
        {devanagari && (
          <span className="ml-2 font-devanagari text-sm normal-case tracking-normal text-marigold">
            {devanagari}
          </span>
        )}
      </p>
      <h2 className="mt-2 font-display text-3xl leading-tight md:text-4xl">{title}</h2>
      {sub && <p className="mt-2 text-mutedbrown">{sub}</p>}
    </div>
  );
}
