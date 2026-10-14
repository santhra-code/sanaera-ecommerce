import { loadEnvConfig } from "@next/env";

loadEnvConfig(process.cwd());

const required = [
  "DATABASE_URL",
  "DIRECT_URL",
  "AUTH_SECRET",
  "NEXT_PUBLIC_APP_URL",
  "CRON_SECRET",
  "UPSTASH_REDIS_REST_URL",
  "UPSTASH_REDIS_REST_TOKEN",
  "CLOUDINARY_CLOUD_NAME",
  "CLOUDINARY_API_KEY",
  "CLOUDINARY_API_SECRET",
  "SMTP_HOST",
  "SMTP_PORT",
  "SMTP_USER",
  "SMTP_PASSWORD",
  "EMAIL_FROM",
];

const productionCheck =
  process.argv.includes("--strict") ||
  process.env.VERCEL === "1" ||
  process.env.NODE_ENV === "production";

if (!productionCheck) {
  console.log("Skipping deployment environment validation outside production.");
  process.exit(0);
}

const missing = required.filter((key) => !process.env[key]?.trim());
const problems: string[] = [];

if (process.env.AUTH_SECRET && process.env.AUTH_SECRET.length < 32) {
  problems.push("AUTH_SECRET must contain at least 32 characters.");
}

if (process.env.NEXT_PUBLIC_APP_URL) {
  try {
    const appUrl = new URL(process.env.NEXT_PUBLIC_APP_URL);
    if (appUrl.protocol !== "https:") {
      problems.push("NEXT_PUBLIC_APP_URL must use HTTPS for deployment.");
    }
  } catch {
    problems.push("NEXT_PUBLIC_APP_URL must be a valid absolute URL.");
  }
}

const adminEmail = process.env.SEED_ADMIN_EMAIL?.trim();
const adminPassword = process.env.SEED_ADMIN_PASSWORD;
if (Boolean(adminEmail) !== Boolean(adminPassword)) {
  problems.push("Set both SEED_ADMIN_EMAIL and SEED_ADMIN_PASSWORD before production seeding, or leave both unset.");
}
if (adminPassword && adminPassword.length < 16) {
  problems.push("SEED_ADMIN_PASSWORD must contain at least 16 characters.");
}

if (missing.length || problems.length) {
  if (missing.length) console.error(`Missing required production variables: ${missing.join(", ")}`);
  for (const problem of problems) console.error(problem);
  process.exit(1);
}

console.log("Production environment variables are present and pass basic checks.");
if (!adminEmail) {
  console.warn("No seed administrator is configured. Set SEED_ADMIN_EMAIL/PASSWORD before running db:seed.");
}
console.log("Online payment checkout is not enabled; this app currently routes orders through WhatsApp.");