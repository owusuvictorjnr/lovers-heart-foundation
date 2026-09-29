"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { initialActionState } from "@/lib/action-result";
import { MultiImageUpload } from "@/features/media/components/multi-image-upload";
import { updateAboutContent } from "../actions";
import type { AboutContent } from "../types";

export function AboutContentForm({ initialData }: { initialData: AboutContent }) {
  const [state, formAction] = useActionState(
    updateAboutContent,
    initialActionState,
  );

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state]);

  const val1 = initialData.values[0] || { title: "", text: "" };
  const val2 = initialData.values[1] || { title: "", text: "" };
  const val3 = initialData.values[2] || { title: "", text: "" };

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
            placeholder="e.g. Who We Are & Why We Serve"
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
            placeholder="e.g. Faith in action, uplifting one child's home at a time."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Narrative Paragraph 1
          </label>
          <textarea
            name="paragraph1"
            rows={3}
            defaultValue={initialData.paragraph1}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="First narrative paragraph..."
          />
        </div>

        <div className="sm:col-span-2">
          <label className="block text-sm font-bold text-ink">
            Narrative Paragraph 2
          </label>
          <textarea
            name="paragraph2"
            rows={3}
            defaultValue={initialData.paragraph2}
            required
            className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            placeholder="Second narrative paragraph..."
          />
        </div>
      </div>

      {/* Photography & Carousel */}
      <div className="border-t border-line/80 pt-6">
        <h3 className="font-serif text-lg font-bold text-ink mb-1">
          About Story Photos &amp; Carousel
        </h3>
        <p className="text-xs text-muted mb-4">
          Add photos of volunteers and team activities. Multiple photos will auto-rotate in a smooth carousel.
        </p>

        <MultiImageUpload
          name="imagesJson"
          folder="gallery"
          defaultImages={initialData.images}
          label="About Section Photos"
        />

        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-bold text-ink">
              Photo Badge Tag
            </label>
            <input
              type="text"
              name="imageBadge"
              defaultValue={initialData.imageBadge}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              placeholder="e.g. Hands-on Service in Ghana"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink">
              Photo Caption
            </label>
            <input
              type="text"
              name="imageCaption"
              defaultValue={initialData.imageCaption}
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
              placeholder="e.g. Volunteers organizing textbooks, bags of rice..."
            />
          </div>
        </div>
      </div>

      {/* Quote Card */}
      <div className="border-t border-line/80 pt-6">
        <h3 className="font-serif text-lg font-bold text-ink mb-3">
          Editorial Quote Card
        </h3>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label className="block text-sm font-bold text-ink">
              Quote Text
            </label>
            <textarea
              name="quote"
              rows={2}
              defaultValue={initialData.quote}
              required
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            />
          </div>
          <div>
            <label className="block text-sm font-bold text-ink">
              Quote Author Attribution
            </label>
            <input
              type="text"
              name="quoteAuthor"
              defaultValue={initialData.quoteAuthor}
              required
              className="mt-1.5 w-full rounded-xl border border-line bg-white px-4 py-2.5 text-sm text-ink focus:border-forest focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* 3 Core Value Pillars */}
      <div className="border-t border-line/80 pt-6">
        <h3 className="font-serif text-lg font-bold text-ink mb-1">
          3 Core Values
        </h3>
        <p className="text-xs text-muted mb-4">
          Customize the 3 value highlights displayed alongside the about section.
        </p>

        <div className="space-y-4">
          {/* Value 1 */}
          <div className="rounded-2xl border border-line bg-sand/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Value 1</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="value1Title"
                  defaultValue={val1.title}
                  required
                  placeholder="Title (e.g. Compassionate Presence)"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  name="value1Text"
                  defaultValue={val1.text}
                  required
                  placeholder="Description..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Value 2 */}
          <div className="rounded-2xl border border-line bg-sand/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Value 2</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="value2Title"
                  defaultValue={val2.title}
                  required
                  placeholder="Title (e.g. 100% Direct Giving)"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  name="value2Text"
                  defaultValue={val2.text}
                  required
                  placeholder="Description..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Value 3 */}
          <div className="rounded-2xl border border-line bg-sand/30 p-4">
            <span className="text-xs font-bold uppercase tracking-wider text-forest">Value 3</span>
            <div className="mt-2 grid gap-3 sm:grid-cols-2">
              <div>
                <input
                  type="text"
                  name="value3Title"
                  defaultValue={val3.title}
                  required
                  placeholder="Title (e.g. Grassroots Community)"
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                />
              </div>
              <div className="sm:col-span-2">
                <input
                  type="text"
                  name="value3Text"
                  defaultValue={val3.text}
                  required
                  placeholder="Description..."
                  className="w-full rounded-xl border border-line bg-white px-3.5 py-2 text-sm text-ink focus:border-forest focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex justify-end pt-4 border-t border-line">
        <SubmitButton>Save About Changes</SubmitButton>
      </div>
    </form>
  );
}
