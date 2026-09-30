"use client";

import Image from "next/image";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/field";
import { deleteGalleryImage, updateGalleryImage } from "../../actions";
import type { GalleryItem } from "../gallery-grid";

export function GalleryManager({ images }: { images: GalleryItem[] }) {
  if (!images.length) return <p className="py-10 text-center text-muted">No photos yet. Upload your first ones above.</p>;
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {images.map((img) => <GalleryTile key={img.id} image={img} />)}
    </div>
  );
}

function GalleryTile({ image }: { image: GalleryItem }) {
  const [caption, setCaption] = useState(image.caption);
  const [year, setYear] = useState(image.year);
  const [pending, start] = useTransition();
  const dirty = caption !== image.caption || year !== image.year;

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-white">
      <div className="relative aspect-[4/3] bg-sand">
        <Image src={image.url} alt={image.caption} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
      </div>
      <div className="grid gap-2 p-3">
        <Input value={caption} onChange={(e) => setCaption(e.target.value)} aria-label="Caption" className="py-2 text-sm" />
        <div className="flex gap-2">
          <Input type="number" value={year} onChange={(e) => setYear(+e.target.value)} aria-label="Year" className="w-24 py-2 text-sm" />
          <Button
            size="sm"
            variant="forest"
            disabled={!dirty || pending}
            onClick={() => start(async () => {
              const r = await updateGalleryImage(image.id, { caption, year });
              if (r.ok) toast.success(r.message); else toast.error(r.message);
            })}
          >
            Save
          </Button>
          <Button
            size="sm"
            variant="subtle"
            className="ml-auto text-clay"
            disabled={pending}
            onClick={() => {
              if (!confirm("Delete this photo? This can't be undone.")) return;
              start(async () => {
                const r = await deleteGalleryImage(image.id);
                if (r.ok) toast.success(r.message); else toast.error(r.message);
              });
            }}
          >
            Delete
          </Button>
        </div>
      </div>
    </div>
  );
}
