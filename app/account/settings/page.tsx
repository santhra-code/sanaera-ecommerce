import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import NewsletterToggle from "@/components/account/NewsletterToggle";

export const metadata = { title: "Settings — SANAÉRA" };

export default async function SettingsPage() {
  const session = await auth();
  const subscriber = session!.user.email
    ? await prisma.newsletterSubscriber.findUnique({ where: { email: session!.user.email } })
    : null;

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Settings</h1>

      <div className="bg-emerald-deep p-6 max-w-[420px] mb-8">
        <h3 className="text-[11px] uppercase tracking-[0.1em] text-text-secondary mb-4">
          Communication
        </h3>
        <NewsletterToggle initialSubscribed={subscriber?.isActive ?? false} />
      </div>

      <p className="text-[12px] text-text-secondary max-w-[420px]">
        Language and currency preferences are on the roadmap once
        international shipping (Phase 6+) is wired in.
      </p>
    </div>
  );
}
