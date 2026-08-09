import Link from "next/link";
import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Customers — Admin" };

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  await requirePermission("customer:read");
  const { q } = await searchParams;

  const customers = await prisma.user.findMany({
    where: {
      role: { name: "CUSTOMER" },
      ...(q
        ? {
            OR: [
              { firstName: { contains: q, mode: "insensitive" } },
              { lastName: { contains: q, mode: "insensitive" } },
              { email: { contains: q, mode: "insensitive" } },
              { phone: { contains: q, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-6">Customers</h1>

      <form className="mb-8 max-w-[360px]">
        <input
          name="q"
          defaultValue={q ?? ""}
          placeholder="Search by name, email, or phone…"
          className="w-full bg-transparent border-b border-line text-[14px] text-warmwhite py-2 focus:outline-none focus:border-champagne"
        />
      </form>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wide text-text-secondary border-b border-line">
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Segment</th>
              <th className="py-3 pr-4">Orders</th>
              <th className="py-3 pr-4">Lifetime Spend</th>
              <th className="py-3 pr-4">Joined</th>
              <th className="py-3"></th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="border-b border-line">
                <td className="py-3 pr-4 text-warmwhite">
                  {c.firstName} {c.lastName}
                </td>
                <td className="py-3 pr-4 text-text-secondary">{c.email}</td>
                <td className="py-3 pr-4 text-champagne text-[12px] uppercase tracking-wide">
                  {c.customerSegment}
                </td>
                <td className="py-3 pr-4 text-text-secondary">{c.orderCount}</td>
                <td className="py-3 pr-4 text-warmwhite">
                  ₹{Number(c.lifetimeSpend).toLocaleString("en-IN")}
                </td>
                <td className="py-3 pr-4 text-text-secondary">
                  {c.createdAt.toLocaleDateString("en-IN")}
                </td>
                <td className="py-3">
                  <Link href={`/admin/customers/${c.id}`} className="text-champagne hover:underline text-[12px]">
                    View
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {customers.length === 0 && <p className="text-sm text-text-secondary mt-6">No customers found.</p>}
      </div>
    </div>
  );
}
