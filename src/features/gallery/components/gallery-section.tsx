import { Container, SectionHeading } from "@/components/ui/section";
import { listGalleryImages } from "../queries";
import { GalleryGrid } from "./gallery-grid";

const fallbackGallery = [
  {
    id: "g1",
    url: "/images/hero-children.jpg",
    caption: "Joyful moments with children during our annual outreach visit",
    year: new Date().getFullYear() - 1,
  },
  {
    id: "g2",
    url: "/images/about-team.jpg",
    caption: "Volunteers preparing packages of food, rice, and learning materials",
    year: new Date().getFullYear() - 1,
  },
  {
    id: "g3",
    url: "/images/outreach-delivery.jpg",
    caption: "Handing out backpacks and textbooks to eager students",
    year: new Date().getFullYear() - 2,
  },
  {
    id: "g4",
    url: "/images/community-meal.jpg",
    caption: "Sharing a nutritious, heartwarming meal together at the home",
    year: new Date().getFullYear() - 2,
  },
];

export async function GallerySection() {
  const images = await listGalleryImages();
  const displayImages = images.length
    ? images.map(({ id, url, caption, year }) => ({ id, url, caption, year }))
    : fallbackGallery;

  return (
    <section id="gallery" className="py-24 bg-cream">
      <Container>
        <SectionHeading
          center
          eyebrow="Moments of Joy &amp; Service"
          title="Faces of Hope: From Our Outreach Days"
          description="Every photo captures real lives touched by your generosity. Tap any image to see full size."
        />

        <GalleryGrid images={displayImages} />
      </Container>
    </section>
  );
}
