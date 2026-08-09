"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/require-admin";
import { writeAuditLog } from "@/lib/audit-log";
import { RoleName } from "@prisma/client";

type ActionResult = { success: true } | { success: false; error: string };

export async function changeUserRoleAction(userId: string, roleName: RoleName): Promise<ActionResult> {
  const admin = await requirePermission("admin:manage_roles");

  if (userId === admin.id && roleName !== "SUPER_ADMIN") {
    // Cheap guard against a Super Admin locking themselves out by accident.
    // Doesn't prevent a deliberate handover (another Super Admin can still
    // demote them), just accidental self-demotion.
    return { success: false, error: "You can't demote your own account." };
  }

  const targetUser = await prisma.user.findUnique({ where: { id: userId }, include: { role: true } });
  if (!targetUser) return { success: false, error: "User not found." };

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return { success: false, error: "Role not found." };

  await prisma.user.update({ where: { id: userId }, data: { roleId: role.id } });
  await writeAuditLog({
    actorId: admin.id,
    action: "user.change_role",
    entityType: "User",
    entityId: userId,
    metadata: { from: targetUser.role?.name, to: roleName, targetEmail: targetUser.email },
  });

  revalidatePath("/admin/admins");
  return { success: true };
}

export async function promoteByEmailAction(email: string, roleName: RoleName): Promise<ActionResult> {
  const admin = await requirePermission("admin:manage_roles");

  const targetUser = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!targetUser) return { success: false, error: "No account found with that email." };

  const role = await prisma.role.findUnique({ where: { name: roleName } });
  if (!role) return { success: false, error: "Role not found." };

  await prisma.user.update({ where: { id: targetUser.id }, data: { roleId: role.id } });
  await writeAuditLog({
    actorId: admin.id,
    action: "user.promote_by_email",
    entityType: "User",
    entityId: targetUser.id,
    metadata: { from: targetUser.role?.name, to: roleName, email },
  });

  revalidatePath("/admin/admins");
  return { success: true };
}
