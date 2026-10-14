"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { checkRateLimit } from "@/lib/rate-limit";

const newsletterSchema = z.object({ email: z.string().trim().email().max(254) });
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().email().max(254),
  subject: z.string().trim().min(3).max(160),
  message: z.string().trim().min(10).max(5000),
});

type NewsletterActionResult =
  | { success: true }
  | { success: false; error: string };

export async function subscribeNewsletterAction(input: unknown): Promise<NewsletterActionResult> {
  const parsed = newsletterSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Enter a valid email address." };
  }

  const email = parsed.data.email.toLowerCase();
  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { limited } = await checkRateLimit("newsletter", `newsletter:${ip}:${email}`);
  if (limited) {
    return { success: false, error: "Please try again later." };
  }

  try {
    await prisma.newsletterSubscriber.upsert({
      where: { email },
      update: { isActive: true, unsubscribedAt: null, subscribedAt: new Date(), source: "footer" },
      create: { email, source: "footer" },
    });
    return { success: true };
  } catch (error) {
    console.error("Newsletter subscription failed:", error);
    return { success: false, error: "We couldn't subscribe you right now. Please try again." };
  }
}

type ContactActionResult =
  | { success: true }
  | { success: false; error: string };

export async function sendContactMessageAction(input: unknown): Promise<ContactActionResult> {
  const parsed = contactSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Check your details and try again." };
  }

  const requestHeaders = await headers();
  const ip = requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { limited } = await checkRateLimit(
    "contact",
    `contact:${ip}:${parsed.data.email.toLowerCase()}`
  );
  if (limited) return { success: false, error: "Please try again later." };

  try {
    await prisma.contactMessage.create({
      data: {
        name: parsed.data.name,
        email: parsed.data.email.toLowerCase(),
        subject: parsed.data.subject,
        message: parsed.data.message,
      },
    });
    return { success: true };
  } catch (error) {
    console.error("Contact message submission failed:", error);
    return { success: false, error: "We couldn't send your message right now. Please try again." };
  }
}