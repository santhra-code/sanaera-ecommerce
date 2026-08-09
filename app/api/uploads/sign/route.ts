import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { signUpload } from "@/lib/cloudinary";
import type { PermissionKey } from "@/lib/rbac";

// Every uploadable folder and what it takes to upload into it. "self" means
// "any logged-in user, uploading to their own scoped subfolder" (avatars) —
// checked separately below rather than via the permissions list.
const FOLDER_RULES: Record<string, PermissionKey | "self"> = {
  products: "product:write",
  categories: "category:write",
  collections: "collection:write",
  banners: "banner:write",
  avatars: "self",
};

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json().catch(() => null);
  const folderKey = body?.folder as string | undefined;
  if (!folderKey || !(folderKey in FOLDER_RULES)) {
    return NextResponse.json({ error: "Unknown upload folder" }, { status: 400 });
  }

  const rule = FOLDER_RULES[folderKey];
  if (rule === "self") {
    // Any authenticated user can upload their own avatar — scoped to their
    // own user id so they can't overwrite someone else's Cloudinary asset
    // by guessing a public_id.
  } else if (!session.user.permissions?.includes(rule)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  // Namespaced by folder (and, for avatars, by user id) so uploads never
  // collide across admins/products or between two different customers.
  const folder =
    folderKey === "avatars" ? `sanaera/avatars/${session.user.id}` : `sanaera/${folderKey}`;

  const signed = signUpload({ folder });
  return NextResponse.json(signed);
}
