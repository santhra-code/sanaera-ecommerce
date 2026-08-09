import { cookies } from "next/headers";
import { nanoid } from "nanoid";

const COOKIE_NAME = "guest_session_id";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 60; // 60 days

/** Reads the guest session cookie, creating one if it doesn't exist yet. */
export async function getOrCreateGuestSessionId(): Promise<string> {
  const store = await cookies();
  const existing = store.get(COOKIE_NAME)?.value;
  if (existing) return existing;

  const id = nanoid(24);
  store.set(COOKIE_NAME, id, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
  return id;
}

export async function getGuestSessionId(): Promise<string | null> {
  const store = await cookies();
  return store.get(COOKIE_NAME)?.value ?? null;
}

export async function clearGuestSessionId() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
}
