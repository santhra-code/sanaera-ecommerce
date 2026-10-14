import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Newsletter Subscribers — Admin" };

export default async function AdminNewsletterPage() {
  await requirePermission("customer:read");
  const subscribers = await prisma.newsletterSubscriber.findMany({
    orderBy: { subscribedAt: "desc" },
    take: 500,
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl text-warmwhite">Newsletter Subscribers</h1>
      <p className="mb-8 text-sm text-text-secondary">Most recent 500 records, including unsubscribed addresses.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-line text-xs uppercase tracking-wide text-text-secondary">
              <th scope="col" className="py-3 pr-4">Email</th>
              <th scope="col" className="py-3 pr-4">Status</th>
              <th scope="col" className="py-3 pr-4">Source</th>
              <th scope="col" className="py-3">Subscribed</th>
            </tr>
          </thead>
          <tbody>
            {subscribers.map((subscriber) => (
              <tr key={subscriber.id} className="border-b border-line">
                <td className="py-3 pr-4 text-warmwhite">{subscriber.email}</td>
                <td className="py-3 pr-4 text-text-secondary">{subscriber.isActive ? "Active" : "Unsubscribed"}</td>
                <td className="py-3 pr-4 text-text-secondary">{subscriber.source ?? "—"}</td>
                <td className="py-3 text-text-secondary">{subscriber.subscribedAt.toLocaleDateString("en-IN")}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {subscribers.length === 0 && <p className="mt-6 text-sm text-text-secondary">No subscribers yet.</p>}
      </div>
    </div>
  );
}