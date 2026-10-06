// Wax seals: one per run, missed runs pressed in from the left.
// A missed run is a poured-wax mark (irregular rim, pressed inner ring, stamped J);
// an attended run is an empty ring where a seal could have gone.

const RIM =
  "M21.77 10.66Q22.38 12.00 22.24 13.48Q22.09 14.96 21.11 16.10Q20.13 17.23 19.31 18.36Q18.49 19.49 17.38 20.43Q16.28 21.36 14.88 21.83Q13.48 22.31 12.06 21.90Q10.63 21.50 9.01 21.81Q7.38 22.11 6.23 21.05Q5.08 19.99 4.24 18.76Q3.39 17.53 2.90 16.17Q2.41 14.81 1.74 13.41Q1.07 12.00 1.40 10.49Q1.73 8.99 2.83 7.90Q3.93 6.81 4.56 5.48Q5.19 4.14 6.54 3.57Q7.89 3.00 9.18 2.19Q10.47 1.38 11.93 1.87Q13.39 2.35 14.88 2.39Q16.37 2.44 17.58 3.30Q18.79 4.16 19.51 5.43Q20.23 6.71 20.69 8.01Q21.16 9.31 21.77 10.66Z";

// Each seal sits at its own angle so a row never looks machine-stamped.
const TURNS = [0, 47, 113, 191, 251, 302, 23, 167];

export function Seal({ missed, size = 20, index = 0 }: { missed: boolean; size?: number; index?: number }) {
  if (!missed) {
    return (
      <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className="shrink-0">
        <circle cx="12" cy="12" r="9.6" fill="none" stroke="var(--seal-empty)" strokeWidth={size < 16 ? 2 : 1.6} />
      </svg>
    );
  }
  const turn = TURNS[index % TURNS.length];
  return (
    <svg aria-hidden width={size} height={size} viewBox="0 0 24 24" className="seal-mark shrink-0">
      <g transform={`rotate(${turn} 12 12)`}>
        <path d={RIM} fill="var(--seal)" />
        <path d={RIM} fill="none" stroke="var(--seal-deep)" strokeWidth="0.8" opacity="0.7" />
      </g>
      <circle cx="12" cy="12" r="6.9" fill="var(--seal-deep)" opacity="0.55" />
      <circle cx="12" cy="12" r="6.9" fill="none" stroke="var(--seal-lip)" strokeWidth="0.9" opacity="0.55" />
      {size >= 16 && (
        <text
          x="12"
          y="15.6"
          textAnchor="middle"
          fontSize="10"
          fontWeight="700"
          fill="var(--seal-lip)"
          style={{ fontFamily: "var(--font-trirong), serif" }}
        >
          J
        </text>
      )}
    </svg>
  );
}

export function Seals({
  total,
  missed,
  size = 20,
  label,
}: {
  total: number;
  missed: number;
  size?: number;
  label: string;
}) {
  const count = Math.max(total, missed);
  return (
    <span role="img" aria-label={label} className="flex flex-wrap gap-[5px]">
      {Array.from({ length: count }, (_, i) => (
        <Seal key={i} index={i} missed={i < missed} size={size} />
      ))}
    </span>
  );
}
