"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { initialActionState } from "@/lib/action-result";
import { MultiImageUpload } from "@/features/media/components/multi-image-upload";
import { updateOutreachContent } from "../actions";
import type { OutreachContent } from "../types";

export function OutreachContentForm({
  initialData,
}: {
  initialData: OutreachContent;
}) {
  const [state, formAction] = useActionState(
    updateOutreachContent,
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
            Eyebrow Tag
          </label>
          <input
            type="text"
            name="eyebrow"
            defaultValue={initialData.eyebrow}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="e.g. Our Journey of Giving"
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Main Heading
          </label>
          <input
            type="text"
            name="title"
            defaultValue={initialData.title}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="e.g. A continuous legacy of showing up."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Story Description
          </label>
          <textarea
            name="description"
            rows={3}
            defaultValue={initialData.description}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="Describe the journey of giving across Ghana..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Sponsor Button Label
          </label>
          <input
            type="text"
            name="sponsorButtonText"
            defaultValue={initialData.sponsorButtonText}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="e.g. Sponsor Annual Outreach"
          />
        </div>
      </div>

      {/* Photography & Carousel */}
      <div className="border-t border-line/80 pt-6">
        <h3 className="font-serif text-lg font-bold text-ink mb-1">
          Outreach Journey Photos &amp; Carousel
        </h3>
        <p className="text-xs text-muted mb-4">
          Add photos depicting distribution and outreach delivery. Multiple photos will auto-rotate in a smooth carousel.
        </p>

        <MultiImageUpload
          name="imagesJson"
          folder="outreach"
          defaultImages={initialData.images}
          label="Outreach Story Photos"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-ink">
              Caption Highlight Tag
            </label>
            <input
              type="text"
              name="imageTag"
              defaultValue={initialData.imageTag}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              placeholder="e.g. Direct Handover:"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink">
              Caption Text
            </label>
            <input
              type="text"
              name="imageCaption"
              defaultValue={initialData.imageCaption}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              placeholder="e.g. Every bag, book, and meal is placed directly in children's hands."
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-line">
        <SubmitButton>Save Outreach Story Changes</SubmitButton>
      </div>
    </form>
  );
}
