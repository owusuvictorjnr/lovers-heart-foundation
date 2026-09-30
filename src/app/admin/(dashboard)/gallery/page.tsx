import { Card } from "@/components/ui/card";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { GalleryManager } from "@/features/gallery/components/admin/gallery-manager";
import { GalleryUploader } from "@/features/gallery/components/admin/gallery-uploader";
import { listGalleryImages } from "@/features/gallery/queries";

export const metadata = { title: "Gallery" };

export default async function AdminGalleryPage() {
  await requireAdmin();
  const images = await listGalleryImages();
  return (
    <>
      <PageHeader title="Gallery" description={`${images.length} photo${images.length === 1 ? "" : "s"} on the website`} />
      <Card className="mb-8 max-w-2xl p-6">
        <h2 className="mb-4 text-xl">Upload photos</h2>
        <GalleryUploader />
      </Card>
      <GalleryManager images={images.map(({ id, url, caption, year }) => ({ id, url, caption, year }))} />
    </>
  );
}
