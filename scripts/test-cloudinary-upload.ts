import fs from "fs";
import path from "path";
import { v2 as cloudinary } from "cloudinary";

// Load env
const envPath = path.join(process.cwd(), ".env");
if (fs.existsSync(envPath)) {
  const env = fs.readFileSync(envPath, "utf8");
  for (const line of env.split(/\r?\n/)) {
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
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

async function main() {
  const sample = path.join(process.cwd(), "public", "products", "blouse-1.jpeg");
  if (!fs.existsSync(sample)) {
    console.error("Sample image not found:", sample);
    process.exit(1);
  }

  try {
    const res = await cloudinary.uploader.upload(sample, {
      folder: `sanaera/test-upload`,
      use_filename: true,
      unique_filename: false,
    });
    console.log("Upload successful:", { url: res.secure_url, publicId: res.public_id });
  } catch (err) {
    console.error("Upload failed:", err);
    process.exit(1);
  }
}

main();
