# Cloudinary Asset Migration & Compatibility Guide

## Overview

As part of the rebranding to **Lovers Heart Foundation**, upload destination folders on Cloudinary have been updated from `god-is-alive/*` to `lovers-heart-foundation/*`.

This document explains the backward compatibility strategy for existing media assets and provides an optional migration procedure for consolidating historical assets in Cloudinary.

---

## 1. Compatibility & Zero-Downtime Guarantee

### How Media Assets Are Stored
When an image is uploaded through the Admin Portal, the following attributes are saved to PostgreSQL:
- `url`: The complete HTTPS CDN delivery URL (e.g. `https://res.cloudinary.com/<cloud_name>/image/upload/v1234567890/god-is-alive/gallery/sample.jpg`)
- `publicId`: The full asset identifier (e.g. `god-is-alive/gallery/sample`)

### Public Facing Views
- Public pages and hero components render the exact `url` retrieved from the database.
- Cloudinary serves images by their asset URL directly via CDN.
- **Result**: Existing photos and hero banners uploaded under the `god-is-alive/` folder continue to display with zero downtime and no visual disruption.

### Admin Deletion
- When an admin deletes a gallery item, `destroyImage(image.publicId)` sends the exact `publicId` stored in the database to the Cloudinary Admin API.
- **Result**: Existing assets in `god-is-alive/` are cleanly deleted from Cloudinary just like new assets in `lovers-heart-foundation/`.

---

## 2. New Uploads

All newly uploaded assets through the Admin Dashboard are routed to:
- Gallery photos: `lovers-heart-foundation/gallery/`
- Children's homes hero banners: `lovers-heart-foundation/homes/`

The codebase retains legacy aliases in [`src/features/media/lib/cloudinary.ts`](file:///home/vitech/Desktop/Projects/Web/god-is-alive-web/src/features/media/lib/cloudinary.ts):
```ts
export const MEDIA_FOLDERS = {
  gallery: "lovers-heart-foundation/gallery",
  homes: "lovers-heart-foundation/homes",
} as const;

export const LEGACY_MEDIA_FOLDERS = {
  gallery: "god-is-alive/gallery",
  homes: "god-is-alive/homes",
} as const;
```

---

## 3. (Optional) Moving Historical Assets in Cloudinary

If you want to move old assets in Cloudinary into the new folder structure for clean organization:

### Step 1: Move Assets in Cloudinary Console
1. Log into your [Cloudinary Console](https://console.cloudinary.com/).
2. Open **Media Library** -> Navigate to `god-is-alive/gallery` (or `god-is-alive/homes`).
3. Select all assets -> Click **Move** -> Destination: `lovers-heart-foundation/gallery` (or `lovers-heart-foundation/homes`).

### Step 2: Update Database Records in PostgreSQL / Supabase
Run the following SQL migration script in your Supabase SQL Editor:

```sql
-- Update Gallery Images
UPDATE "GalleryImage"
SET
  "publicId" = REPLACE("publicId", 'god-is-alive/', 'lovers-heart-foundation/'),
  "url" = REPLACE("url", 'god-is-alive/', 'lovers-heart-foundation/')
WHERE "publicId" LIKE 'god-is-alive/%';

-- Update Children Homes Hero Images (if any)
UPDATE "ChildrenHome"
SET
  "heroImageUrl" = REPLACE("heroImageUrl", 'god-is-alive/', 'lovers-heart-foundation/')
WHERE "heroImageUrl" LIKE '%god-is-alive/%';
```

---

## Summary

- **No immediate action required**: Existing assets work without changes.
- **New uploads**: Automatically placed in `lovers-heart-foundation/`.
- **Clean consolidation**: Can be performed at any time using the 2-step process above without breaking application functionality.
