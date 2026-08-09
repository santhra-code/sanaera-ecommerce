import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Audit Logs — Admin" };

export default async function AuditLogsPage({
  searchParams,
}: {
  searchParams: Promise<{ entityType?: string }>;
}) {
  await requirePermission("admin:view_audit_log");
  const { entityType } = await searchParams;

  const [logs, entityTypes] = await Promise.all([
    prisma.auditLog.findMany({
      where: entityType ? { entityType } : undefined,
      orderBy: { createdAt: "desc" },
      take: 200,
      include: { actor: { select: { firstName: true, lastName: true, email: true } } },
    }),
    prisma.auditLog.findMany({
      distinct: ["entityType"],
      select: { entityType: true },
    }),
  ]);

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Audit Logs</h1>
      <p className="text-sm text-text-secondary mb-8">
        Every mutating admin action, most recent 200. Nothing here is editable —
        that's the point of an audit trail.
      </p>

      <div className="flex gap-2 mb-8 flex-wrap">
        <a
          href="/admin/audit-logs"
          className={`text-[11px] uppercase tracking-wide px-3 py-1.5 border ${
            !entityType ? "border-champagne text-champagne" : "border-line text-text-secondary"
          }`}
        >
          All
        </a>
        {entityTypes.map((e) => (
          <a
            key={e.entityType}
            href={`/admin/audit-logs?entityType=${e.entityType}`}
            className={`text-[11px] uppercase tracking-wide px-3 py-1.5 border ${
              entityType === e.entityType
                ? "border-champagne text-champagne"
                : "border-line text-text-secondary"
            }`}
          >
            {e.entityType}
          </a>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-[12.5px]">
          <thead>
            <tr className="text-left uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">When</th>
              <th className="py-3 pr-4">Actor</th>
              <th className="py-3 pr-4">Action</th>
              <th className="py-3 pr-4">Entity</th>
              <th className="py-3 pr-4">IP</th>
              <th className="py-3">Details</th>
            </tr>
          </thead>
          <tbody>
            {logs.map((log) => (
              <tr key={log.id} className="border-b border-line align-top">
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                  {log.createdAt.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" })}
                </td>
                <td className="py-3 pr-4 text-warmwhite whitespace-nowrap">
                  {log.actor.firstName} {log.actor.lastName}
                </td>
                <td className="py-3 pr-4 text-champagne whitespace-nowrap">{log.action}</td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                  {log.entityType}
                  <div className="text-[10.5px] opacity-70">{log.entityId}</div>
                </td>
                <td className="py-3 pr-4 text-text-secondary whitespace-nowrap">
                  {log.ipAddress ?? "—"}
                </td>
                <td className="py-3 text-text-secondary">
                  {log.metadata ? (
                    <pre className="text-[10.5px] whitespace-pre-wrap break-all opacity-80">
                      {JSON.stringify(log.metadata)}
                    </pre>
                  ) : (
                    "—"
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {logs.length === 0 && <p className="text-sm text-text-secondary mt-6">No activity logged yet.</p>}
      </div>
    </div>
  );
}
