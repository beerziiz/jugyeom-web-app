"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type SettingsState = { error?: "invalid" | "failed"; ok?: boolean };

const parse = (value: FormDataEntryValue | null) => {
  const n = Number(value);
  return Number.isInteger(n) && n >= 1 && n <= 99 ? n : null;
};

export async function updateSettings(_prev: SettingsState, formData: FormData): Promise<SettingsState> {
  const missThreshold = parse(formData.get("miss_threshold"));
  const kickAfter = parse(formData.get("kick_after_warnings"));
  if (!missThreshold || !kickAfter) return { error: "invalid" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("settings")
    .update({ miss_threshold: missThreshold, kick_after_warnings: kickAfter, updated_at: new Date().toISOString() })
    .eq("id", true);
  if (error) return { error: "failed" };

  revalidatePath("/admin", "layout");
  revalidatePath("/");
  return { ok: true };
}
