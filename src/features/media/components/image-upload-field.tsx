"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { MediaFolder } from "../lib/cloudinary";
import { uploadImage } from "../lib/upload";

/** Single-image upload that writes the resulting URL into a hidden form input. */
export function ImageUploadField({ name, folder, defaultValue }: { name: string; folder: MediaFolder; defaultValue?: string | null }) {
  const [url, setUrl] = useState(defaultValue ?? "");
  const [progress, setProgress] = useState<number | null>(null);

  async function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return toast.error("Image must be under 10MB");
    try {
      setProgress(0);
      const res = await uploadImage(file, folder, setProgress);
      setUrl(res.secure_url);
    } catch {
      toast.error("Upload failed. Please try again.");
    } finally {
      setProgress(null);
      e.target.value = "";
    }
  }

  return (
    <div className="grid gap-2 text-sm font-semibold">
      <span>Photo <small className="font-normal text-muted">(optional)</small></span>
      <input type="hidden" name={name} value={url} />
      <div className="flex items-center gap-4">
        <div className="relative grid size-24 shrink-0 place-items-center overflow-hidden rounded-xl bg-sand text-xs font-normal text-muted">
          {url ? <Image src={url} alt="" fill sizes="96px" className="object-cover" /> : "No photo"}
        </div>
        <div className="flex flex-wrap gap-2">
          <label className="cursor-pointer rounded-full border border-line bg-white px-3.5 py-2 hover:border-gold">
            {progress !== null ? `Uploading ${progress}%` : url ? "Replace" : "Upload photo"}
            <input type="file" accept="image/*" className="sr-only" onChange={onChange} disabled={progress !== null} />
          </label>
          {url && <Button type="button" size="sm" variant="subtle" onClick={() => setUrl("")}>Remove</Button>}
        </div>
      </div>
    </div>
  );
}
