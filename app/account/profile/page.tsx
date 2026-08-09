import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ProfileForm from "@/components/account/ProfileForm";
import AvatarUploader from "@/components/account/AvatarUploader";

export const metadata = { title: "Profile — SANAÉRA" };

export default async function ProfilePage() {
  const session = await auth();
  const user = await prisma.user.findUniqueOrThrow({ where: { id: session!.user.id } });

  return (
    <div>
      <h1 className="font-display text-3xl text-warmwhite mb-2">Profile</h1>
      <p className="text-sm text-text-secondary mb-8">{user.email} · not editable here</p>
      <AvatarUploader currentImage={user.image} />
      <ProfileForm
        initial={{
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone ?? "",
        }}
      />
    </div>
  );
}
