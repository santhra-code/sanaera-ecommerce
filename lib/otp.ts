import { randomBytes } from "crypto";
import { nanoid } from "nanoid";
import { prisma } from "@/lib/prisma";
import { VerificationTokenType } from "@prisma/client";

const OTP_TTL_MINUTES = 10;
const RESET_TOKEN_TTL_MINUTES = 30;

/** 6-digit numeric code, e.g. for email verification during signup. */
export function generateOtpCode(): string {
  const n = randomBytes(4).readUInt32BE(0) % 1_000_000;
  return n.toString().padStart(6, "0");
}

/**
 * Creates a VerificationToken row and returns the raw token/code.
 * For OTP, `token` IS the 6-digit code (short + email-friendly).
 * For PASSWORD_RESET, `token` is a long random id embedded in a reset link.
 */
export async function createVerificationToken(
  identifier: string,
  type: VerificationTokenType
) {
  // Invalidate any previous unexpired tokens of the same type for this identifier
  // so only the most recently requested code/link is valid.
  await prisma.verificationToken.deleteMany({ where: { identifier, type } });

  const token = type === VerificationTokenType.OTP ? generateOtpCode() : nanoid(48);
  const ttlMinutes = type === VerificationTokenType.OTP ? OTP_TTL_MINUTES : RESET_TOKEN_TTL_MINUTES;

  await prisma.verificationToken.create({
    data: {
      identifier,
      token,
      type,
      expires: new Date(Date.now() + ttlMinutes * 60_000),
    },
  });

  return token;
}

export async function consumeVerificationToken(
  identifier: string,
  token: string,
  type: VerificationTokenType
): Promise<{ valid: boolean; expired: boolean }> {
  const record = await prisma.verificationToken.findUnique({
    where: { identifier_token: { identifier, token } },
  });

  if (!record || record.type !== type) return { valid: false, expired: false };

  const expired = record.expires < new Date();

  // One-time use: delete on any consumption attempt (valid or expired) so a
  // leaked/guessed code can't be replayed after the fact.
  await prisma.verificationToken.delete({ where: { id: record.id } });

  if (expired) return { valid: false, expired: true };
  return { valid: true, expired: false };
}
