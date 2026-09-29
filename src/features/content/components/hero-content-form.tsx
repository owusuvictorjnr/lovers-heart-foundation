"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { initialActionState } from "@/lib/action-result";
import { MultiImageUpload } from "@/features/media/components/multi-image-upload";
import { updateHeroContent } from "../actions";
import type { HeroContent } from "../types";

export function HeroContentForm({ initialData }: { initialData: HeroContent }) {
  const [state, formAction] = useActionState(
    updateHeroContent,
    initialActionState,
  );

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  return (
    <form action={formAction} className="grid gap-6">
      <FormMessage state={state} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Top Eyebrow Badge
          </label>
          <input
            type="text"
            name="badge"
            defaultValue={initialData.badge}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="e.g. Grassroots Ghanaian NGO · In-Person Annual Outreach"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink">
            Hero Headline (Main Text)
          </label>
          <input
            type="text"
            name="title"
            defaultValue={initialData.title}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="e.g. Every child in Ghana deserves to know they are"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-ink">
            Headline Highlight (Colored &amp; Underlined)
          </label>
          <input
            type="text"
            name="titleHighlight"
            defaultValue={initialData.titleHighlight}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="e.g. cherished & loved."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Hero Description Paragraph
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData.description}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="Enter the main hero paragraph..."
          />
        </div>
      </div>

      <div className="border-t border-line/80 pt-6">
        <h3 className="font-serif text-lg font-bold text-ink mb-1">
          Hero Photograph &amp; Carousel
        </h3>
        <p className="text-xs text-muted mb-4">
          Add one photo or multiple photos. If multiple photos are added, they will rotate in a smooth, swipeable carousel on the website.
        </p>

        <MultiImageUpload
          name="imagesJson"
          folder="gallery"
          defaultImages={initialData.images}
          label="Hero Showcase Photos"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-ink">
              Photo Tag / Badge
            </label>
            <input
              type="text"
              name="imageCaption"
              defaultValue={initialData.imageCaption}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              placeholder="e.g. Joy & Dignity"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink">
              Photo Subtitle / Description
            </label>
            <input
              type="text"
              name="imageSubcaption"
              defaultValue={initialData.imageSubcaption}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              placeholder="e.g. Touching lives with every visit across Ghanaian regions"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-line">
        <SubmitButton>Save Hero Changes</SubmitButton>
      </div>
    </form>
  );
}
