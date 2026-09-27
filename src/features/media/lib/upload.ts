import { getUploadSignature } from "../actions";
import type { MediaFolder } from "./cloudinary";

export type UploadedImage = { secure_url: string; public_id: string; width: number; height: number };

/** Browser → Cloudinary signed upload with progress. */
export async function uploadImage(file: File, folder: MediaFolder, onProgress?: (percent: number) => void) {
  const sig = await getUploadSignature(folder);
  return new Promise<UploadedImage>((resolve, reject) => {
    const body = new FormData();
    body.append("file", file);
    body.append("api_key", sig.apiKey);
    body.append("timestamp", String(sig.timestamp));
    body.append("folder", sig.folder);
    body.append("signature", sig.signature);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${sig.cloudName}/image/upload`);
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress?.(Math.round((e.loaded / e.total) * 100));
    xhr.onload = () => (xhr.status < 300 ? resolve(JSON.parse(xhr.responseText)) : reject(new Error("Upload failed")));
    xhr.onerror = () => reject(new Error("Network error"));
    xhr.send(body);
  });
}
