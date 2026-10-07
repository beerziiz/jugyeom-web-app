// Matches names read from a screenshot to the roster. OCR slips a letter now and then
// (e.g. 乂 read as X), so an exact match is tried first, then the closest close-enough name.

const normalize = (s: string) =>
  s
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, "");

function distance(a: string, b: string) {
  const prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    let diag = prev[0];
    prev[0] = i;
    for (let j = 1; j <= b.length; j++) {
      const next = Math.min(prev[j] + 1, prev[j - 1] + 1, diag + (a[i - 1] === b[j - 1] ? 0 : 1));
      diag = prev[j];
      prev[j] = next;
    }
  }
  return prev[b.length];
}

export function matchMember<M extends { id: number; ign: string }>(name: string, roster: M[]): M | null {
  const target = normalize(name);
  if (!target) return null;
  const exact = roster.filter((m) => normalize(m.ign) === target);
  if (exact.length === 1) return exact[0];

  const limit = Math.max(1, Math.floor(target.length / 5));
  let best: M | null = null;
  let bestDistance = Infinity;
  let tie = false;
  for (const m of roster) {
    const d = distance(target, normalize(m.ign));
    if (d < bestDistance) {
      best = m;
      bestDistance = d;
      tie = false;
    } else if (d === bestDistance) {
      tie = true;
    }
  }
  return best && bestDistance <= limit && !tie ? best : null;
}
