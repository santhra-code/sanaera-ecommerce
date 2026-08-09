import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ChangePasswordForm from "@/components/account/ChangePasswordForm";

export const metadata = { title: "Security — SANAÉRA" };

export default async function SecurityPage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-8">Security</h1>

      {user.passwordHash ? (
        <ChangePasswordForm />
      ) : (
        <p className="text-sm text-text-secondary max-w-[420px]">
          This account signs in with Google, so there's no SANAÉRA password to
          change. Manage your Google account's security settings directly
          with Google.
        </p>
      )}
    </div>
  );
}
