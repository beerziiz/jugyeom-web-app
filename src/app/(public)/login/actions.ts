"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

// Officers sign in with a username. Supabase Auth needs an email, so each
// officer account is created as <username>@jugyeom.local (see supabase/create-officer.sql).
const USERNAME_DOMAIN = "jugyeom.local";

export type LoginState = { error?: "failed" | "notOfficer" };

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const username = String(formData.get("username") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  if (!username || !password) return { error: "failed" };

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({
    email: `${username}@${USERNAME_DOMAIN}`,
    password,
  });
  if (error || !data.user) return { error: "failed" };

  const { data: officer } = await supabase
    .from("officers")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();

  if (!officer) {
    await supabase.auth.signOut();
    return { error: "notOfficer" };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/");
}
