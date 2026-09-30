"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Field, Input } from "@/components/ui/field";
import { uploadImage } from "@/features/media/lib/upload";
import { saveGalleryImage } from "../../actions";

type Upload = { name: string; progress: number; error?: string };

const MAX_MB = 10;

export function GalleryUploader() {
  const [uploads, setUploads] = useState<Upload[]>([]);
  const [busy, setBusy] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [caption, setCaption] = useState("");
  const [year, setYear] = useState(new Date().getFullYear());

  async function handleUpload() {
    const files = [...(fileRef.current?.files ?? [])];
    if (!files.length) return toast.error("Choose at least one photo");
    if (caption.trim().length < 2) return toast.error("Add a caption");

    setBusy(true);
    setUploads(files.map((f) => ({ name: f.name, progress: 0 })));
    const update = (i: number, patch: Partial<Upload>) =>
      setUploads((u) => u.map((x, j) => (j === i ? { ...x, ...patch } : x)));

    let added = 0;
    try {
      for (const [i, file] of files.entries()) {
        if (!file.type.startsWith("image/")) { update(i, { error: "Not an image" }); continue; }
        if (file.size > MAX_MB * 1024 * 1024) { update(i, { error: `Over ${MAX_MB}MB` }); continue; }
        try {
          const res = await uploadImage(file, "gallery", (p) => update(i, { progress: p }));
          const saved = await saveGalleryImage({
            url: res.secure_url, publicId: res.public_id, width: res.width, height: res.height, caption, year,
          });
          if (!saved.ok) throw new Error(saved.message);
          added++;
        } catch (e) {
          update(i, { error: e instanceof Error ? e.message : "Failed" });
        }
      }
    } finally {
      setBusy(false);
    }
    if (added) {
      toast.success(`${added} photo${added > 1 ? "s" : ""} added`);
      if (fileRef.current) fileRef.current.value = "";
      setCaption("");
    }
  }

  return (
    <div className="grid gap-4">
      <Field label="Photos" hint={`JPG/PNG, up to ${MAX_MB}MB each, select several at once`}>
        <Input ref={fileRef} type="file" accept="image/*" multiple disabled={busy} className="file:mr-3 file:rounded-full file:border-0 file:bg-gold-soft file:px-3 file:py-1 file:font-semibold" />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_140px]">
        <Field label="Caption" hint="applied to all selected photos">
          <Input value={caption} onChange={(e) => setCaption(e.target.value)} placeholder="e.g. Delivering food to Osu Children's Home" disabled={busy} />
        </Field>
        <Field label="Year">
          <Input type="number" value={year} onChange={(e) => setYear(+e.target.value)} disabled={busy} />
        </Field>
      </div>
      <Button onClick={handleUpload} disabled={busy} variant="forest">{busy ? "Uploading…" : "Upload photos"}</Button>

      {uploads.length > 0 && (
        <ul className="grid gap-2 text-sm">
          {uploads.map((u) => (
            <li key={u.name} className="grid gap-1">
              <div className="flex justify-between gap-2">
                <span className="truncate">{u.name}</span>
                <span className={u.error ? "text-clay" : "text-muted"}>{u.error ?? `${u.progress}%`}</span>
              </div>
              {!u.error && (
                <div className="h-1.5 overflow-hidden rounded-full bg-sand">
                  <div className="h-full bg-forest-light transition-all" style={{ width: `${u.progress}%` }} />
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
