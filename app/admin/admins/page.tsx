import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";
import { PERMISSIONS, ROLE_PERMISSIONS, ADMIN_TIER_ROLES } from "@/lib/rbac";
import RoleSelect from "@/components/admin/RoleSelect";
import PromoteAdminForm from "@/components/admin/PromoteAdminForm";

export const metadata = { title: "Admins & Roles — Admin" };

export default async function AdminsPage() {
  await requirePermission("admin:manage_roles");

  const adminUsers = await prisma.user.findMany({
    where: { role: { name: { in: ADMIN_TIER_ROLES } } },
    include: { role: true },
    orderBy: { createdAt: "asc" },
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Admins & Roles</h1>
      <p className="text-sm text-text-secondary mb-10">
        {adminUsers.length} admin-tier account{adminUsers.length !== 1 ? "s" : ""}.
      </p>

      <h2 className="font-display text-xl text-warmwhite mb-4">Grant Access</h2>
      <div className="mb-14">
        <PromoteAdminForm />
      </div>

      <h2 className="font-display text-xl text-warmwhite mb-4">Current Admins</h2>
      <div className="overflow-x-auto mb-14">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Last Login</th>
              <th className="py-3">Role</th>
            </tr>
          </thead>
          <tbody>
            {adminUsers.map((u) => (
              <tr key={u.id} className="border-b border-line">
                <td className="py-3 pr-4 text-warmwhite">
                  {u.firstName} {u.lastName}
                </td>
                <td className="py-3 pr-4 text-text-secondary">{u.email}</td>
                <td className="py-3 pr-4 text-text-secondary">
                  {u.lastLoginAt ? u.lastLoginAt.toLocaleDateString("en-IN") : "Never"}
                </td>
                <td className="py-3">
                  <RoleSelect
                     userId={u.id} role={u.role?.name ?? ""}
                  />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="font-display text-xl text-warmwhite mb-2">Role Permissions</h2>
      <p className="text-[12px] text-text-secondary mb-4 max-w-[640px]">
        Read-only: permissions are defined in code (<code>lib/rbac.ts</code>) rather than
        editable here, so that what a role can do is always visible in version control and
        code review, not silently changed at runtime. Ask an engineer to adjust
        <code> ROLE_PERMISSIONS</code> if a role needs different access.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full text-[12px]">
          <thead>
            <tr className="text-left uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Permission</th>
              {ADMIN_TIER_ROLES.map((r) => (
                <th key={r} className="py-3 pr-4">{r.replace("_", " ")}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PERMISSIONS.map((perm) => (
              <tr key={perm} className="border-b border-line">
                <td className="py-2.5 pr-4 text-warmwhite">{perm}</td>
                {ADMIN_TIER_ROLES.map((r) => (
                  <td key={r} className="py-2.5 pr-4">
                    {ROLE_PERMISSIONS[r].includes(perm) ? (
                      <span className="text-champagne">✓</span>
                    ) : (
                      <span className="text-text-secondary/30">—</span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
