import { loadBoard } from "@/lib/board";
import { ogSize, renderBoardCard } from "@/lib/og-card";

// Discord link preview of this week's board; drawn by renderBoardCard.
export const alt = "Jugyeom · กระดานกิลด์";
export const size = ogSize;
export const contentType = "image/png";

export default async function Image() {
  const board = await loadBoard("th");
  return renderBoardCard({
    threshold: board.threshold,
    members: board.members,
    weekStart: board.period?.week_start ?? null,
  });
}
