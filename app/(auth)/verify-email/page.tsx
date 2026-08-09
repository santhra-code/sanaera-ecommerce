import { redirect } from "next/navigation";
import OtpForm from "@/components/auth/OtpForm";

export const metadata = { title: "Verify Email — SANAÉRA" };

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string }>;
}) {
  const { email } = await searchParams;
  if (!email) redirect("/register");

  return <OtpForm email={email} />;
}
