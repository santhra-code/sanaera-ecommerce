import nodemailer from "nodemailer";

// Lazily created so this file can be imported without SMTP env vars present
// (e.g. during `next build` type-checking) without throwing.
let transporter: nodemailer.Transporter | null = null;

function getTransporter() {
  if (transporter) return transporter;
  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT ?? 587),
    secure: Number(process.env.SMTP_PORT) === 465,
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASSWORD },
  });
  return transporter;
}

const FROM = process.env.EMAIL_FROM ?? "SANAÉRA <hello@sanaera.com>";
const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

// Minimal shared wrapper so every email gets consistent brand chrome without
// pulling in a template engine for Phase 2. Swap for react-email later if
// the design needs to get fancier.
function emailShell(title: string, bodyHtml: string) {
  return `
  <div style="background:#2D0C1C;padding:48px 24px;font-family:Georgia,'Times New Roman',serif;">
    <div style="max-width:520px;margin:0 auto;background:#381222;border:1px solid rgba(222,176,146,0.28);padding:40px;">
      <div style="font-size:22px;letter-spacing:0.3em;color:#FDF8F6;margin-bottom:32px;">SANAÉRA</div>
      <h1 style="font-size:22px;font-weight:400;color:#FDF8F6;margin:0 0 20px;">${title}</h1>
      <div style="font-size:15px;line-height:1.7;color:#E8D8CF;font-family:Arial,sans-serif;">${bodyHtml}</div>
      <div style="margin-top:36px;padding-top:20px;border-top:1px solid rgba(228,216,207,0.15);font-size:11px;color:#BFA89B;font-family:Arial,sans-serif;">
        © ${new Date().getFullYear()} SANAÉRA House of Craft
      </div>
    </div>
  </div>`;
}

export async function sendWelcomeEmail(to: string, firstName: string) {
  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: "Welcome to SANAÉRA",
    html: emailShell(
      `Welcome, ${firstName}.`,
      `<p>Your account has been created. Explore heritage craftsmanship reimagined for the modern world.</p>
       <p><a href="${APP_URL}" style="color:#DEB092;">Continue to SANAÉRA →</a></p>`
    ),
  });
}

export async function sendVerificationOtpEmail(to: string, code: string) {
  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: `${code} is your SANAÉRA verification code`,
    html: emailShell(
      "Verify your email",
      `<p>Enter this code to verify your email address. It expires in 10 minutes.</p>
       <p style="font-size:32px;letter-spacing:0.2em;color:#DEB092;font-family:Georgia,serif;">${code}</p>
       <p>If you didn't request this, you can safely ignore this email.</p>`
    ),
  });
}

export async function sendPasswordResetEmail(to: string, resetToken: string) {
  const resetUrl = `${APP_URL}/reset-password?token=${resetToken}&email=${encodeURIComponent(to)}`;
  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: "Reset your SANAÉRA password",
    html: emailShell(
      "Reset your password",
      `<p>Click below to set a new password. This link expires in 30 minutes.</p>
       <p><a href="${resetUrl}" style="color:#DEB092;">Reset Password →</a></p>
       <p>If you didn't request this, you can safely ignore this email — your password won't change.</p>`
    ),
  });
}

export async function sendLowStockAlertEmail(
  to: string,
  items: { productTitle: string; sku: string; availableStock: number; threshold: number }[]
) {
  const rows = items
    .map(
      (i) =>
        `<tr><td style="padding:6px 12px 6px 0;">${i.productTitle}</td><td style="padding:6px 12px;color:#BFA89B;">${i.sku}</td><td style="padding:6px;color:#DEB092;">${i.availableStock} left (threshold ${i.threshold})</td></tr>`
    )
    .join("");

  await getTransporter().sendMail({
    from: FROM,
    to,
    subject: `${items.length} product${items.length !== 1 ? "s" : ""} running low on stock`,
    html: emailShell(
      "Low stock alert",
      `<p>The following variants have fallen at or below their low-stock threshold:</p>
       <table style="width:100%;border-collapse:collapse;font-size:13px;">${rows}</table>
       <p style="margin-top:20px;"><a href="${APP_URL}/admin/inventory" style="color:#DEB092;">Review inventory →</a></p>`
    ),
  });
}

export async function sendPasswordChangedEmail(to: string) {
  await getTransporter().sendMail({
    html: emailShell(
      "Password changed",
      `<p>Your password was just changed. If this wasn't you, contact us immediately and reset your password.</p>`
    ),
  });
}
