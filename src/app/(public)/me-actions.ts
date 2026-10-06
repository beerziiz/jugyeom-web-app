"use server";

import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { ME_COOKIE } from "@/lib/me";

export async function setMe(formData: FormData) {
  const id = Number(formData.get("id"));
  if (!Number.isInteger(id) || id <= 0) return;
  (await cookies()).set(ME_COOKIE, String(id), {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });
  revalidatePath("/");
}

export async function clearMe() {
  (await cookies()).delete(ME_COOKIE);
  revalidatePath("/");
}
