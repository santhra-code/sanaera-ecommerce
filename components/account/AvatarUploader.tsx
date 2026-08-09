"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import CloudinaryUploader, { type UploadedImage } from "@/components/CloudinaryUploader";
import { updateAvatarAction } from "@/app/account/actions";

export default function AvatarUploader({ currentImage }: { currentImage: string | null }) {
  const router = useRouter();
  const [preview, setPreview] = useState(currentImage);
  const [saving, setSaving] = useState(false);

  async function handleUploaded(images: UploadedImage[]) {
    const [img] = images;
    if (!img) return;
    setSaving(true);
    setPreview(img.url);
    await updateAvatarAction(img.url);
    setSaving(false);
    router.refresh();
  }

  return (
    <div className="flex items-center gap-5 mb-8">
      <div className="w-16 h-16 rounded-full overflow-hidden bg-emerald flex items-center justify-center">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <span className="text-text-secondary text-xl font-display">?</span>
        )}
      </div>
      <CloudinaryUploader folder="avatars" onUploaded={handleUploaded} />
      {saving && <span className="text-[11px] text-text-secondary">Saving…</span>}
    </div>
  );
}
