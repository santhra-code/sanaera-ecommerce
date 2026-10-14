import { requirePermission } from "@/lib/require-admin";
import { prisma } from "@/lib/prisma";

export const metadata = { title: "Contact Messages — Admin" };

export default async function AdminContactPage() {
  await requirePermission("customer:read");
  const messages = await prisma.contactMessage.findMany({
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl text-warmwhite">Contact Messages</h1>
      <p className="mb-8 text-sm text-text-secondary">Most recent 100 customer enquiries.</p>
      {messages.length === 0 ? (
        <p className="text-sm text-text-secondary">No messages received yet.</p>
      ) : (
        <div className="grid gap-px bg-line">
          {messages.map((message) => (
            <article key={message.id} className="bg-emerald-deep p-5">
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-3">
                <h2 className="text-sm font-medium text-warmwhite">{message.subject}</h2>
                <span className="text-xs text-text-secondary">
                  {message.createdAt.toLocaleString("en-IN")} · {message.status}
                </span>
              </div>
              <p className="mb-3 whitespace-pre-wrap text-sm leading-relaxed text-sand">{message.message}</p>
              <p className="text-xs text-text-secondary">
                {message.name} · <a className="text-champagne underline" href={`mailto:${encodeURIComponent(message.email)}`}>{message.email}</a>
              </p>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}