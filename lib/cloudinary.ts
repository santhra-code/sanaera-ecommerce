import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

/**
 * Signs an upload request for a specific folder so the browser can upload
 * directly to Cloudinary (never through our server — keeps large image
 * payloads off our own compute/bandwidth). The signature is only valid for
 * this exact timestamp+folder+publicId combination, and callers must have
 * already passed a permission check for that folder (see
 * app/api/uploads/sign/route.ts) before this is called.
 */
export function signUpload(params: { folder: string; publicId?: string }) {
  const timestamp = Math.round(Date.now() / 1000);
  const paramsToSign: Record<string, string | number> = {
    timestamp,
    folder: params.folder,
    ...(params.publicId ? { public_id: params.publicId } : {}),
  };

  const signature = cloudinary.utils.api_sign_request(
    paramsToSign,
    process.env.CLOUDINARY_API_SECRET as string
  );

  return {
    signature,
    timestamp,
    apiKey: process.env.CLOUDINARY_API_KEY,
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    folder: params.folder,
    publicId: params.publicId,
  };
}

export async function deleteCloudinaryImage(publicId: string) {
  try {
    await cloudinary.uploader.destroy(publicId);
  } catch (err) {
    // Non-fatal: a failed cleanup shouldn't block the DB mutation that
    // triggered it (e.g. deleting a product shouldn't fail because one of
    // its five images couldn't be purged from Cloudinary). Log for the
    // admin who reads server logs; consider a periodic orphan-image sweep
    // if this needs to be more robust than best-effort.
    console.error(`Failed to delete Cloudinary image ${publicId}:`, err);
  }
}
