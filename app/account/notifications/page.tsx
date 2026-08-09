import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import MarkReadButton from "@/components/account/MarkReadButton";
import MarkAllReadButton from "@/components/account/MarkAllReadButton";

export const metadata = { title: "Notifications — SANAÉRA" };

export default async function NotificationsPage() {
  const session = await auth();
  const notifications = await prisma.notification.findMany({
    where: { userId: session!.user.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h1 className="font-display text-3xl text-warmwhite">Notifications</h1>
        {notifications.some((n) => !n.isRead) && <MarkAllReadButton />}
      </div>

      {notifications.length === 0 ? (
        <p className="text-sm text-text-secondary">Nothing here yet.</p>
      ) : (
        <div className="flex flex-col gap-px bg-line">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`px-6 py-4 flex justify-between items-start gap-6 ${
                n.isRead ? "bg-emerald-deep" : "bg-emerald"
              }`}
            >
              <div>
                <div className="text-sm text-warmwhite">{n.title}</div>
                <div className="text-[12px] text-text-secondary mt-1">{n.body}</div>
                <div className="text-[10.5px] text-text-secondary/70 mt-1.5">
                  {n.createdAt.toLocaleDateString("en-IN", { year: "numeric", month: "short", day: "numeric" })}
                </div>
              </div>
              {!n.isRead && <MarkReadButton id={n.id} />}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
