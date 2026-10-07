"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

/** Records an officer's decision on a week over the limit: warn ("open") or let it go ("cleared"). */
export async function decideWarning(memberId: number, periodId: number, misses: number, warn: boolean) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  await supabase.from("warnings").upsert(
    {
      member_id: memberId,
      period_id: periodId,
      misses,
      status: warn ? "open" : "cleared",
      created_by: user.id,
    },
    { onConflict: "member_id,period_id" },
  );
  refresh();
}

/** Withdraws a warning. It stays on record as cleared and no longer counts toward a kick. */
export async function clearWarning(id: number) {
  const supabase = await createClient();
  await supabase.from("warnings").update({ status: "cleared" }).eq("id", id);
  refresh();
}

/** The officers removed this member in game: close their warnings as kicked and mark them as left. */
export async function kickMember(memberId: number) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("warnings")
    .update({ status: "kicked" })
    .eq("member_id", memberId)
    .eq("status", "open");
  if (error) return;

  await supabase
    .from("members")
    .update({ left_at: new Date().toISOString().slice(0, 10) })
    .eq("id", memberId);
  refresh();
}
