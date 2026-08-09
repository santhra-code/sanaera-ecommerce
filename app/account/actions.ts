"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { profileSchema } from "@/lib/validations/account";

type ActionResult = { success: true; message?: string } | { success: false; error: string };

export async function updateProfileAction(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      firstName: parsed.data.firstName,
      lastName: parsed.data.lastName,
      phone: parsed.data.phone || null,
    },
  });

  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { success: true, message: "Profile updated." };
}

export async function updateAvatarAction(imageUrl: string): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  await prisma.user.update({ where: { id: session.user.id }, data: { image: imageUrl } });
  revalidatePath("/account/profile");
  revalidatePath("/account");
  return { success: true };
}

export async function toggleNewsletterAction(subscribe: boolean): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user?.email) return { success: false, error: "You must be logged in." };

  if (subscribe) {
    await prisma.newsletterSubscriber.upsert({
      where: { email: session.user.email },
      update: { isActive: true, unsubscribedAt: null },
      create: { email: session.user.email, source: "account_settings" },
    });
  } else {
    await prisma.newsletterSubscriber.updateMany({
      where: { email: session.user.email },
      data: { isActive: false, unsubscribedAt: new Date() },
    });
  }

  revalidatePath("/account/settings");
  return { success: true };
}

export async function markAllNotificationsReadAction(): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  await prisma.notification.updateMany({
    where: { userId: session.user.id, isRead: false },
    data: { isRead: true },
  });
  revalidatePath("/account/notifications");
  return { success: true };
}
