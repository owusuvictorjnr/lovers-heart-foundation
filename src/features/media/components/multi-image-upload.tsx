"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { MediaFolder } from "../lib/cloudinary";
import { uploadImage } from "../lib/upload";

interface MultiImageUploadProps {
  name: string;
  folder: MediaFolder;
  defaultImages?: string[];
  maxImages?: number;
  label?: string;
  description?: string;
}

export function MultiImageUpload({
  name,
  folder,
  defaultImages = [],
  maxImages = 8,
  label = "Carousel Photos",
  description = "Upload 1 or more photos. Multiple photos will automatically rotate in a smooth carousel.",
}: MultiImageUploadProps) {
  const [images, setImages] = useState<string[]>(
    defaultImages.filter(Boolean),
  );
  const [progress, setProgress] = useState<number | null>(null);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (images.length + files.length > maxImages) {
      toast.error(`You can upload at most ${maxImages} images.`);
      return;
    }

    try {
      setProgress(0);
      const newUrls: string[] = [];
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        if (file.size > 10 * 1024 * 1024) {
          toast.error(`"${file.name}" exceeds 10MB limit.`);
          continue;
        }
        const res = await uploadImage(file, folder, (p) => {
          const overall = Math.round(((i + p / 100) / files.length) * 100);
          setProgress(overall);
        });
        newUrls.push(res.secure_url);
      }
      setImages((prev) => [...prev, ...newUrls]);
      if (newUrls.length > 0) {
        toast.success(`Successfully uploaded ${newUrls.length} image${newUrls.length === 1 ? "" : "s"}.`);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "An error occurred during upload.";
      toast.error(msg);
    } finally {
      setProgress(null);
      e.target.value = "";
    }
  }

  function handleRemove(index: number) {
    setImages((prev) => prev.filter((_, i) => i !== index));
  }

  function handleMove(index: number, direction: "left" | "right") {
    setImages((prev) => {
      const next = [...prev];
      const targetIndex = direction === "left" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= next.length) return prev;
      const temp = next[index];
      next[index] = next[targetIndex];
      next[targetIndex] = temp;
      return next;
    });
  }

  return (
    <div className="grid gap-3">
      <div>
        <span className="block text-sm font-bold text-ink">{label}</span>
        {description && <p className="text-xs text-muted leading-relaxed mt-0.5">{description}</p>}
      </div>

      {/* Hidden input storing JSON array of image URLs */}
      <input type="hidden" name={name} value={JSON.stringify(images)} />

      {/* Thumbnails Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2.5 sm:gap-3">
        {images.map((url, idx) => (
          <div
            key={url + idx}
            className="group relative aspect-square w-full overflow-hidden rounded-2xl border border-line bg-sand shadow-2xs"
          >
            <Image
              src={url}
              alt=""
              fill
              sizes="(max-width: 640px) 33vw, 120px"
              className="object-cover"
            />
            {/* Slide Index Badge */}
            <span className="absolute top-1 left-1 grid size-5 place-items-center rounded-full bg-black/60 text-[10px] font-bold text-white backdrop-blur-xs z-10">
              {idx + 1}
            </span>

            {/* Hover / Focus Actions Toolbar */}
            <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 backdrop-blur-2xs transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 z-20">
              {idx > 0 && (
                <button
                  type="button"
                  onClick={() => handleMove(idx, "left")}
                  aria-label="Move earlier"
                  className="grid size-6.5 place-items-center rounded-full bg-white/25 text-white hover:bg-white/50 active:scale-95 cursor-pointer"
                >
                  <ArrowLeft className="size-3.5" />
                </button>
              )}
              <button
                type="button"
                onClick={() => handleRemove(idx)}
                aria-label="Remove image"
                className="grid size-6.5 place-items-center rounded-full bg-red-600/85 text-white hover:bg-red-600 active:scale-95 cursor-pointer"
              >
                <Trash2 className="size-3.5" />
              </button>
              {idx < images.length - 1 && (
                <button
                  type="button"
                  onClick={() => handleMove(idx, "right")}
                  aria-label="Move later"
                  className="grid size-6.5 place-items-center rounded-full bg-white/25 text-white hover:bg-white/50 active:scale-95 cursor-pointer"
                >
                  <ArrowRight className="size-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}

        {/* Upload New Button */}
        {images.length < maxImages && (
          <label className="flex aspect-square w-full cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-line bg-cream-pure p-2 text-center text-xs font-semibold text-muted transition hover:border-gold hover:text-forest active:scale-98">
            <Plus className="size-5 mb-1 text-gold shrink-0" />
            <span className="leading-tight">
              {progress !== null ? `${progress}%` : "Add Photos"}
            </span>
            <input
              type="file"
              accept="image/*"
              multiple
              className="sr-only"
              onChange={handleFileChange}
              disabled={progress !== null}
            />
          </label>
        )}
      </div>

      {images.length === 0 && (
        <p className="text-xs text-amber-700 italic">
          No custom photos selected. The default website photos will be used.
        </p>
      )}
    </div>
  );
}
