import { ImageResponse } from "next/og";
import { loadBoard } from "@/lib/board";

// Discord link preview: the guild pennant over one pinned notice listing who is
// over the miss limit this week, each with their real seal count.
export const alt = "Jugyeom · กระดานกิลด์";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const BANNER = "#1E4A37";
const STONE = "#121815";
const PAPER = "#25291F";
const BRASS = "#C9A227";
const SEAL = "#C8402F";
const SEAL_DEEP = "#7E2318";
const EMPTY = "#5E6157";
const TEXT = "#EEEBE3";
const MUTED = "#A7AAA2";
const OK = "#7FCB9E";

async function loadFont(family: string, weight: number, text: string) {
  const css = await (
    await fetch(`https://fonts.googleapis.com/css2?family=${family}:wght@${weight}&text=${encodeURIComponent(text)}`)
  ).text();
  const url = css.match(/src: url\((.+?)\) format\('(?:opentype|truetype)'\)/)?.[1];
  if (!url) throw new Error(`font ${family} not found`);
  return (await fetch(url)).arrayBuffer();
}

export default async function Image() {
  const board = await loadBoard("th");
  const { threshold } = board;
  const warned = board.members.filter((m) => m.missed >= threshold).sort((a, b) => b.missed - a.missed);
  const shown = warned.slice(0, 4);

  const fmt = new Intl.DateTimeFormat("th-TH", { day: "numeric", month: "short", timeZone: "UTC" });
  const week = board.period
    ? `สัปดาห์ ${fmt.format(new Date(board.period.week_start))} – ${fmt.format(
        new Date(Date.parse(board.period.week_start) + 6 * 86_400_000),
      )}`
    : "ยังไม่มีการบันทึก";

  const heading = "กระดานกิลด์";
  const listTitle = warned.length ? `โดนเตือนสัปดาห์นี้ ${warned.length} คน` : "สัปดาห์นี้ไม่มีใครเกินลิมิต";
  const more = warned.length > shown.length ? `และอีก ${warned.length - shown.length} คน` : "";
  const names = shown.map((m) => m.ign).join("");
  const counts = shown.map((m) => `ขาด ${m.missed} จาก ${threshold}`).join("");

  const [trirong, anuphan] = await Promise.all([
    loadFont("Trirong", 700, `Jugyeom${heading}${listTitle}${names}`),
    loadFont("Anuphan", 500, `${week}${counts}${more}0123456789`),
  ]);

  const seal = (filled: boolean, key: number) => (
    <div
      key={key}
      style={{
        width: 40,
        height: 40,
        borderRadius: 40,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: filled ? SEAL : "transparent",
        border: filled ? `3px solid ${SEAL_DEEP}` : `3px solid ${EMPTY}`,
      }}
    >
      {filled && <div style={{ width: 22, height: 22, borderRadius: 22, border: `2px solid ${SEAL_DEEP}` }} />}
    </div>
  );

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", background: STONE, color: TEXT }}>
        <div style={{ display: "flex", flexDirection: "column", position: "relative", background: BANNER, padding: "52px 80px 92px" }}>
          <div style={{ fontFamily: "Trirong", fontSize: 84, lineHeight: 1.15 }}>{heading}</div>
          <div style={{ fontFamily: "Anuphan", fontSize: 34, color: "#CFE0D6", marginTop: 2 }}>{week}</div>
          <div
            style={{
              position: "absolute",
              left: 0,
              bottom: 0,
              width: 0,
              height: 0,
              borderLeft: "600px solid transparent",
              borderRight: "600px solid transparent",
              borderBottom: `56px solid ${STONE}`,
            }}
          />
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            position: "relative",
            margin: "-8px 80px 0",
            padding: "34px 44px 30px",
            background: PAPER,
            borderRadius: 8,
            border: warned.length ? `4px solid ${SEAL}` : "none",
          }}
        >
          <div
            style={{ position: "absolute", top: -13, left: 506, width: 26, height: 26, borderRadius: 26, background: BRASS }}
          />
          <div style={{ fontFamily: "Trirong", fontSize: 40, color: warned.length ? TEXT : OK }}>{listTitle}</div>
          <div style={{ display: "flex", flexWrap: "wrap", marginTop: 14 }}>
            {shown.map((m) => (
              <div key={m.id} style={{ display: "flex", alignItems: "center", width: 500, marginTop: 10 }}>
                <div style={{ fontFamily: "Trirong", fontSize: 34, maxWidth: 260, overflow: "hidden", marginRight: 18 }}>{m.ign}</div>
                <div style={{ display: "flex", gap: 8 }}>
                  {Array.from({ length: Math.max(threshold, m.missed) }, (_, i) => seal(i < m.missed, i))}
                </div>
              </div>
            ))}
          </div>
          {more && <div style={{ fontFamily: "Anuphan", fontSize: 28, color: MUTED, marginTop: 10 }}>{more}</div>}
        </div>
        <div style={{ position: "absolute", right: 80, bottom: 26, fontFamily: "Trirong", fontSize: 28, color: MUTED }}>
          Jugyeom
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Trirong", data: trirong, weight: 700, style: "normal" },
        { name: "Anuphan", data: anuphan, weight: 500, style: "normal" },
      ],
    },
  );
}
