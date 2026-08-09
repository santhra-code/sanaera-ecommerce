"use client";

import { useState } from "react";

export type UploadedImage = { url: string; publicId: string };

async function uploadOne(file: File, folder: string): Promise<UploadedImage> {
  const signRes = await fetch("/api/uploads/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) {
    const body = await signRes.json().catch(() => null);
    throw new Error(body?.error ?? "Couldn't get an upload signature");
  }
  const { signature, timestamp, apiKey, cloudName, folder: signedFolder } = await signRes.json();

  const formData = new FormData();
  formData.append("file", file);
  formData.append("api_key", apiKey);
  formData.append("timestamp", String(timestamp));
  formData.append("signature", signature);
  formData.append("folder", signedFolder);

  const uploadRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!uploadRes.ok) {
    throw new Error("Cloudinary upload failed");
  }
  const uploaded = await uploadRes.json();
  return { url: uploaded.secure_url, publicId: uploaded.public_id };
}

/**
 * folder: one of the keys FOLDER_RULES in app/api/uploads/sign/route.ts
 * knows about ("products", "categories", "collections", "banners", "avatars").
 */
export default function CloudinaryUploader({
  folder,
  multiple = false,
  onUploaded,
}: {
  folder: string;
  multiple?: boolean;
  onUploaded: (images: UploadedImage[]) => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFiles(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setError(null);
    setUploading(true);
    try {
      const files = Array.from(fileList);
      const results = await Promise.all(files.map((f) => uploadOne(f, folder)));
      onUploaded(results);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <label className="inline-block cursor-pointer text-[12px] uppercase tracking-[0.1em] text-champagne border border-champagne px-4 py-2.5 hover:bg-champagne hover:text-matte-black transition-colors">
        {uploading ? "Uploading…" : multiple ? "Upload Images" : "Upload Image"}
        <input
          type="file"
          accept="image/*"
          multiple={multiple}
          disabled={uploading}
          onChange={(e) => handleFiles(e.target.files)}
          className="hidden"
        />
      </label>
      {error && <p className="text-maroon text-[12px] mt-2">{error}</p>}
    </div>
  );
}
