/**
 * Parametric mandala ornament — geometric, single-stroke, never clip-art.
 * Rendered at low opacity as a backdrop; pointer-events disabled.
 */
export default function Mandala({
  size = 480,
  petals = 24,
  className = "",
  strokeWidth = 1,
}: {
  size?: number;
  petals?: number;
  className?: string;
  strokeWidth?: number;
}) {
  const cx = 200;
  const cy = 200;
  const petalElems = [];
  for (let i = 0; i < petals; i++) {
    const angle = (360 / petals) * i;
    petalElems.push(
      <ellipse
        key={`p-${i}`}
        cx={cx}
        cy={cy - 118}
        rx="26"
        ry="72"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        transform={`rotate(${angle} ${cx} ${cy})`}
      />
    );
  }
  const innerDots = [];
  for (let i = 0; i < petals; i++) {
    const angle = ((360 / petals) * i * Math.PI) / 180;
    innerDots.push(
      <circle
        key={`d-${i}`}
        cx={cx + 52 * Math.cos(angle)}
        cy={cy + 52 * Math.sin(angle)}
        r="3"
        fill="currentColor"
      />
    );
  }
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 400 400"
      className={className}
      aria-hidden="true"
      style={{ pointerEvents: "none" }}
    >
      <circle cx={cx} cy={cy} r="192" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="3 7" />
      {petalElems}
      <circle cx={cx} cy={cy} r="88" fill="none" stroke="currentColor" strokeWidth={strokeWidth} />
      <circle cx={cx} cy={cy} r="64" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeDasharray="2 5" />
      {innerDots}
      <circle cx={cx} cy={cy} r="18" fill="none" stroke="currentColor" strokeWidth={strokeWidth * 1.5} />
      <circle cx={cx} cy={cy} r="5" fill="currentColor" />
    </svg>
  );
}
