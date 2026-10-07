import { ImageResponse } from "next/og";

// Discord link preview: the score bug and title, then one card listing who is
// warned this week, each with their allowance row.

export const ogSize = { width: 1200, height: 630 };

const GROUND = "#13121F";
const PANEL = "#1D1C2E";
const PANEL_2 = "#26253A";
const LIVE = "#F2B33D";
const LIVE_INK = "#2A1D08";
const MISS = "#F0484A";
const TEXT = "#F2F1F8";
const MUTED = "#AAA8C2";
const OK = "#7FD0EE";

async function loadFont(axes: string, text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${axes}&text=${encodeURIComponent(text)}`)
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`font ${axes} not found`);
  return (await fetch(url)).arrayBuffer();
}

export async function renderBoardCard({
  threshold,
  members,
  weekStart,
}: {
  threshold: number;
  members: { id: number; ign: string; missed: number }[];
  weekStart: string | null;
}) {
  const warned = members.filter((m) => m.missed >= threshold).sort((a, b) => b.missed - a.missed);
  const shown = warned.slice(0, 4);

  const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });
  const week = weekStart
    ? `สัปดาห์ ${fmt.format(new Date(weekStart))} – ${fmt.format(new Date(Date.parse(weekStart) + 6 * 86_400_000))}`
    : "ยังไม่มีการบันทึก";

  const heading = "กระดานกิลด์";
  const listTitle = warned.length ? `โดนเตือนสัปดาห์นี้ ${warned.length} คน` : "สัปดาห์นี้ไม่มีใครโดนเตือน";
  const more = warned.length > shown.length ? `และอีก ${warned.length - shown.length} คน` : "";
  const names = shown.map((m) => m.ign).join("");
  const counts = shown.map((m) => `${m.missed}/${threshold}`).join("");

  const [kanit, anuphan] = await Promise.all([
    loadFont("Kanit:ital,wght@1,800", `JUGYEOM${heading}${listTitle}${names}${counts}0123456789/…+`),
    loadFont("Anuphan:wght@500", `${week}${more}`),
  ]);

  // Allowance row: white = misses left before a warning; a warned week shows every
  // used plate solid red, and misses past the limit follow the limit bar.
  const mark = (kind: "life" | "gap" | "over", key: number | string) => (
    <div
      key={key}
      style={{
        width: 30,
        height: 18,
        borderRadius: 2,
        flexShrink: 0,
        transform: "skewX(-18deg)",
        background: kind === "life" ? TEXT : kind === "over" ? MISS : "transparent",
        border: kind === "gap" ? `3px solid ${MISS}` : "none",
      }}
    />
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: GROUND, color: TEXT, padding: "52px 80px" }}>
        <div style={{ display: "flex", alignItems: "stretch" }}>
          <div style={{ display: "flex", alignItems: "center", background: LIVE, color: LIVE_INK, padding: "6px 30px", fontFamily: "Kanit", fontSize: 30, transform: "skewX(-18deg)" }}>
            <div style={{ transform: "skewX(18deg)" }}>JUGYEOM</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", background: PANEL_2, padding: "6px 30px", marginLeft: 4, fontFamily: "Anuphan", fontSize: 28, transform: "skewX(-18deg)" }}>
            <div style={{ transform: "skewX(18deg)" }}>{week}</div>
          </div>
        </div>
        <div style={{ fontFamily: "Kanit", fontSize: 96, lineHeight: 1.1, marginTop: 26, flexShrink: 0 }}>{heading}</div>

        <div style={{ display: "flex", flexDirection: "column", marginTop: 28, padding: "28px 40px 26px", background: PANEL, borderRadius: 6 }}>
          <div style={{ fontFamily: "Kanit", fontSize: 40, color: warned.length ? TEXT : OK }}>{listTitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap" }}>
            {shown.map((m) => {
              const used = Math.min(m.missed, threshold);
              const over = Math.max(m.missed - threshold, 0);
              return (
                <div key={m.id} style={{ display: "flex", alignItems: "center", width: 470, marginTop: 16 }}>
                  <div style={{ fontFamily: "Kanit", fontSize: 30, width: 170, flexShrink: 0, overflow: "hidden", whiteSpace: "nowrap", textOverflow: "ellipsis", marginRight: 16 }}>{m.ign}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    {Array.from({ length: threshold }, (_, i) => mark(i < threshold - used ? "life" : m.missed >= threshold ? "over" : "gap", i))}
                    {over > 0 && (
                      <div style={{ width: 4, height: 30, margin: "0 4px", background: TEXT, transform: "skewX(-18deg)" }} />
                    )}
                    {Array.from({ length: Math.min(over, 1) }, (_, i) => mark("over", `o${i}`))}
                    {over > 1 && <div style={{ fontFamily: "Kanit", fontSize: 26, color: MISS, marginLeft: 4, flexShrink: 0 }}>{`+${over - 1}`}</div>}
                  </div>
                </div>
              );
            })}
          </div>
          {more && <div style={{ fontFamily: "Anuphan", fontSize: 28, color: MUTED, marginTop: 12 }}>{more}</div>}
        </div>
      </div>
    ),
    {
      ...ogSize,
      fonts: [
        { name: "Kanit", data: kanit, weight: 800, style: "italic" },
        { name: "Anuphan", data: anuphan, weight: 500, style: "normal" },
      ],
    },
  );
}
