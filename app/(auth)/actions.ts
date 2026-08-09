"use server";

import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/password";
import { createVerificationToken, consumeVerificationToken } from "@/lib/otp";
import {
  sendVerificationOtpEmail,
  sendPasswordResetEmail,
  sendPasswordChangedEmail,
  sendWelcomeEmail,
} from "@/lib/email";
import {
  registerSchema,
  otpSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  changePasswordSchema,
} from "@/lib/validations/auth";
import { checkRateLimit } from "@/lib/rate-limit";
import { auth } from "@/lib/auth";
import { VerificationTokenType } from "@prisma/client";

type ActionResult = { success: true; message?: string } | { success: false; error: string };

export async function registerAction(input: unknown): Promise<ActionResult> {
  const parsed = registerSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { firstName, lastName, email, phone, password } = parsed.data;

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    // Deliberately vague — don't confirm an email is/isn't registered.
    return { success: false, error: "Unable to create account with these details." };
  }

  const customerRole = await prisma.role.findUniqueOrThrow({ where: { name: "CUSTOMER" } });
  const passwordHash = await hashPassword(password);

  const user = await prisma.user.create({
    data: {
      firstName,
      lastName,
      email,
      phone: phone || null,
      passwordHash,
      roleId: customerRole.id,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  const code = await createVerificationToken(user.email, VerificationTokenType.OTP);
  await sendVerificationOtpEmail(user.email, code);

  return { success: true, message: "Account created. Check your email for a verification code." };
}

export async function requestOtpAction(email: string): Promise<ActionResult> {
  const { limited } = await checkRateLimit("otpRequest", `otp:${email}`);
  if (limited) return { success: false, error: "Too many requests. Try again in a few minutes." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Same response whether or not the account exists.
  if (user && !user.isVerified) {
    const code = await createVerificationToken(email, VerificationTokenType.OTP);
    await sendVerificationOtpEmail(email, code);
  }
  return { success: true, message: "If that email needs verifying, a new code was sent." };
}

export async function verifyOtpAction(input: unknown): Promise<ActionResult> {
  const parsed = otpSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter the 6-digit code." };
  const { email, code } = parsed.data;

  const { valid, expired } = await consumeVerificationToken(
    email,
    code,
    VerificationTokenType.OTP
  );
  if (!valid) {
    return {
      success: false,
      error: expired ? "That code expired — request a new one." : "That code is incorrect.",
    };
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true, emailVerified: new Date() },
  });
  await sendWelcomeEmail(user.email, user.firstName);

  return { success: true, message: "Email verified. You can now log in." };
}

export async function forgotPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = forgotPasswordSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter a valid email address." };
  const { email } = parsed.data;

  const { limited } = await checkRateLimit("passwordReset", `reset:${email}`);
  if (limited) return { success: false, error: "Too many requests. Try again in a few minutes." };

  const user = await prisma.user.findUnique({ where: { email } });
  // Always the same message — never confirm whether an account exists.
  if (user && user.passwordHash) {
    const token = await createVerificationToken(email, VerificationTokenType.PASSWORD_RESET);
    await sendPasswordResetEmail(email, token);
  }
  return {
    success: true,
    message: "If an account exists for that email, a reset link is on its way.",
  };
}

export async function resetPasswordAction(input: unknown): Promise<ActionResult> {
  const parsed = resetPasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { email, token, password } = parsed.data;

  const { valid, expired } = await consumeVerificationToken(
    email,
    token,
    VerificationTokenType.PASSWORD_RESET
  );
  if (!valid) {
    return {
      success: false,
      error: expired ? "That reset link expired — request a new one." : "Invalid reset link.",
    };
  }

  const passwordHash = await hashPassword(password);
  await prisma.user.update({ where: { email }, data: { passwordHash } });
  await sendPasswordChangedEmail(email);

  return { success: true, message: "Password updated. You can now log in." };
}

export async function changePasswordAction(input: unknown): Promise<ActionResult> {
  const session = await auth();
  if (!session?.user) return { success: false, error: "You must be logged in." };

  const parsed = changePasswordSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.errors[0]?.message ?? "Invalid input" };
  }
  const { currentPassword, newPassword } = parsed.data;

  const user = await prisma.user.findUniqueOrThrow({ where: { id: session.user.id } });
  if (!user.passwordHash) {
    return {
      success: false,
      error: "This account signs in with Google and has no password to change.",
    };
  }
  const valid = await verifyPassword(currentPassword, user.passwordHash);
  if (!valid) return { success: false, error: "Current password is incorrect." };

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
  await sendPasswordChangedEmail(user.email);

  return { success: true, message: "Password changed." };
}
