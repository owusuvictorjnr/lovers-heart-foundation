import { PhotoPlaceholder } from "@/components/ui/photo-placeholder";
import { Container, SectionHeading } from "@/components/ui/section";
import { listGalleryImages } from "../queries";
import { GalleryGrid } from "./gallery-grid";

export async function GallerySection() {
  const images = await listGalleryImages();

  return (
    <section id="gallery" className="py-24">
      <Container>
        <SectionHeading center eyebrow="Gallery" title="From our donation days" description={images.length ? "Tap any photo to view it full size." : undefined} />
        {images.length ? (
          <GalleryGrid images={images.map(({ id, url, caption, year }) => ({ id, url, caption, year }))} />
        ) : (
          <div className="grid auto-rows-[150px] grid-cols-2 gap-4 md:auto-rows-[210px] md:grid-cols-4">
            <PhotoPlaceholder label="Photos coming soon" className="col-span-2 row-span-2 rounded-2xl" />
            <PhotoPlaceholder label="Upload in admin" tone={1} className="rounded-2xl" />
            <PhotoPlaceholder label="Upload in admin" tone={2} className="rounded-2xl" />
            <PhotoPlaceholder label="Upload in admin" tone={0} className="col-span-2 rounded-2xl" />
          </div>
        )}
      </Container>
    </section>
  );
}
