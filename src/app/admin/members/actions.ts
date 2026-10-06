"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export type MemberRole = "leader" | "officer" | "member";
export type ActionState = { error?: "duplicate" | "failed"; ok?: number };

const ROLES: MemberRole[] = ["leader", "officer", "member"];

function parseRole(value: FormDataEntryValue | null): MemberRole {
  return ROLES.includes(value as MemberRole) ? (value as MemberRole) : "member";
}

function refresh() {
  revalidatePath("/admin", "layout");
  revalidatePath("/");
}

export async function addMembers(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const names = [
    ...new Set(
      String(formData.get("names") ?? "")
        .split(/\r?\n/)
        .map((n) => n.trim())
        .filter(Boolean),
    ),
  ];
  if (!names.length) return {};

  const role = parseRole(formData.get("role"));
  const supabase = await createClient();
  const { error } = await supabase.from("members").insert(names.map((ign) => ({ ign, role })));

  if (error) return { error: error.code === "23505" ? "duplicate" : "failed" };
  refresh();
  return { ok: names.length };
}

export async function updateMember(_prev: ActionState, formData: FormData): Promise<ActionState> {
  const id = Number(formData.get("id"));
  const ign = String(formData.get("ign") ?? "").trim();
  if (!id || !ign) return { error: "failed" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ ign, role: parseRole(formData.get("role")) })
    .eq("id", id);

  if (error) return { error: error.code === "23505" ? "duplicate" : "failed" };
  refresh();
  return { ok: 1 };
}

export async function setMemberLeft(id: number, left: boolean): Promise<ActionState> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("members")
    .update({ left_at: left ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", id);

  if (error) return { error: error.code === "23505" ? "duplicate" : "failed" };
  refresh();
  return { ok: 1 };
}
