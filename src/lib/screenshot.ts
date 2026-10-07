import "server-only";

// Reads one in-game screenshot with Gemini. The officer says which screen it is, so the
// model only fills that screen's fields, all required; that keeps even the lite model exact.

export type ScreenKind = "guild_members" | "guild_war" | "ranking";

export type ScreenRow = {
  name: string;
  checked_in?: boolean;
  castle_done?: number;
  wins?: number;
  losses?: number;
  advent_attacks?: number;
  damage?: number;
  attacks?: number;
};

const COMMON = `Screenshot from the mobile game Seven Knights Re:BIRTH (Thai UI). Return one row per guild member whose row is fully readable, top to bottom.
Copy each name exactly as shown (Thai letters, symbols, capitalisation). Never include the guild name line under a name (e.g. "Jugyeom").
Numbers are digits only. Skip rows cut off at the edge. A row pinned at the bottom that repeats a name already listed: skip it.`;

const SCREENS: Record<ScreenKind, { hint: string; fields: Record<string, "BOOLEAN" | "INTEGER" | "NUMBER"> }> = {
  guild_members: {
    hint: `This is the guild member list (สมาชิกกิลด์). Each row has four status tiles after the score, left to right:
1) check-in: gold tile labelled เช็กชื่อสำเร็จ → checked_in true; grey tile → false.
2) castle: small badge "N/7" at the tile's top right → castle_done = N.
3) guild war: label "W# / L#" → wins, losses.
4) advent: a number under the icon → advent_attacks; grey tile with no number → 0.`,
    fields: { checked_in: "BOOLEAN", castle_done: "INTEGER", wins: "INTEGER", losses: "INTEGER", advent_attacks: "INTEGER" },
  },
  guild_war: {
    hint: `This is the guild war ranking (ข้อมูลอันดับ). Each row shows "ชนะ # แพ้ #" → wins, losses.`,
    fields: { wins: "INTEGER", losses: "INTEGER" },
  },
  ranking: {
    hint: `This is a damage ranking. Each row has a big damage number; some also show "ท้าทาย # ครั้ง" → attacks (0 if not shown).`,
    fields: { damage: "NUMBER", attacks: "INTEGER" },
  },
};

const DEFAULT_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

export class ScreenshotError extends Error {
  code: "no_key" | "busy" | "failed";
  constructor(code: ScreenshotError["code"]) {
    super(code);
    this.code = code;
  }
}

export async function readScreenshot(image: Blob, kind: ScreenKind): Promise<ScreenRow[]> {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new ScreenshotError("no_key");

  const screen = SCREENS[kind];
  const fields = Object.keys(screen.fields);
  const schema = {
    type: "OBJECT",
    properties: {
      rows: {
        type: "ARRAY",
        items: {
          type: "OBJECT",
          properties: {
            name: { type: "STRING" },
            ...Object.fromEntries(Object.entries(screen.fields).map(([k, type]) => [k, { type }])),
          },
          required: ["name", ...fields],
          propertyOrdering: ["name", ...fields],
        },
      },
    },
    required: ["rows"],
  };
  const body = JSON.stringify({
    contents: [
      {
        parts: [
          { inline_data: { mime_type: image.type || "image/jpeg", data: Buffer.from(await image.arrayBuffer()).toString("base64") } },
          { text: `${COMMON}\n\n${screen.hint}` },
        ],
      },
    ],
    generationConfig: { responseMimeType: "application/json", responseSchema: schema, temperature: 0 },
  });

  const models = process.env.GEMINI_MODELS?.split(",").map((m) => m.trim()).filter(Boolean) ?? DEFAULT_MODELS;
  let busy = false;
  // Free-tier models are often overloaded; fall through to the next one.
  for (const model of models) {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: { "x-goog-api-key": key, "content-type": "application/json" },
      body,
    });
    if (res.status === 429 || res.status === 503) {
      busy = true;
      continue;
    }
    if (!res.ok) continue;
    const json = await res.json();
    const text: string | undefined = json.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) continue;
    try {
      const rows = (JSON.parse(text) as { rows: ScreenRow[] }).rows;
      return rows.filter((r) => typeof r.name === "string" && r.name.trim()).map((r) => ({ ...r, name: r.name.trim() }));
    } catch {
      continue;
    }
  }
  throw new ScreenshotError(busy ? "busy" : "failed");
}
