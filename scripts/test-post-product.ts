import fs from "fs/promises";
import path from "path";

async function loadDotEnv() {
  const envPath = path.join(process.cwd(), ".env");
  try {
    const file = await fs.readFile(envPath, "utf8");
    for (const line of file.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) continue;
      const i = trimmed.indexOf("=");
      if (i === -1) continue;
      const k = trimmed.slice(0, i);
      let v = trimmed.slice(i + 1);
      if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
        v = v.slice(1, -1);
      }
      if (!process.env[k]) process.env[k] = v;
    }
  } catch {}
}

async function main() {
  await loadDotEnv();
  const url = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  const endpoint = `${url.replace(/\/$/, "")}/api/products`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title: "must not be created" }),
  });

  if (res.status !== 405) {
    throw new Error(`Expected public product writes to return 405; received ${res.status}.`);
  }
  console.log("PASS: public product creation is disabled (HTTP 405).");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
