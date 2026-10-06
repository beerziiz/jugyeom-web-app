import "server-only";
import { cookies } from "next/headers";

// The visitor's own member id, remembered on this device so their notice is pinned first.
export const ME_COOKIE = "me";

export async function getMe(): Promise<number | null> {
  const value = Number((await cookies()).get(ME_COOKIE)?.value);
  return Number.isInteger(value) && value > 0 ? value : null;
}
