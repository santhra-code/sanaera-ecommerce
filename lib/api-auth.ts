import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";

/**
 * Every wishlist/cart/address/order/notification route handler calls this
 * first. Returns the session's user, or a 401 response to return immediately.
 * There is no way to reach another user's rows through these routes because
 * every query below is written as `where: { userId: user.id, ... }` — never
 * just `where: { id }`.
 */
export async function requireApiUser() {
  const session = await auth();
  if (!session?.user) {
    return { user: null, unauthorized: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }
  return { user: session.user, unauthorized: null };
}
