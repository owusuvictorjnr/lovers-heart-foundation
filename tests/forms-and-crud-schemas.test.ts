import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "../src/features/messages/schemas";
import { volunteerSchema } from "../src/features/volunteers/schemas";
import { homeSchema } from "../src/features/homes/schemas";
import { outreachSchema } from "../src/features/outreach/schemas";
import { galleryMetaSchema, newGalleryImageSchema } from "../src/features/gallery/schemas";

describe("Forms & Entity Schema Validations", () => {
  it("validates contact form inputs and catches honeypots", () => {
    const valid = contactSchema.safeParse({
      name: "Kofi Mensah",
      contact: "0501234567",
      topic: "Donate items",
      body: "Hello, I would like to sponsor food supplies.",
      website: "", // Empty honeypot
    });
    assert.ok(valid.success);

    // Bot filling honeypot
    const bot = contactSchema.safeParse({
      name: "Spam Bot",
      contact: "bot@spam.com",
      topic: "Something else",
      body: "Check out this link",
      website: "http://spam.site", // Filled honeypot
    });
    assert.ok(!bot.success);
  });

  it("validates volunteer sign-up requirements", () => {
    const valid = volunteerSchema.safeParse({
      name: "Akosua Dentaa",
      email: "akosua@example.com",
      phone: "0241112233",
      city: "Kumasi",
      skills: "Teaching, Logistics",
      notes: "Available on weekends",
      website: "",
    });
    assert.ok(valid.success);

    const badEmail = volunteerSchema.safeParse({
      name: "Akosua",
      email: "not-an-email",
      city: "Kumasi",
      skills: "Logistics",
    });
    assert.ok(!badEmail.success);
  });

  it("validates home schema with required name, region, and description", () => {
    const valid = homeSchema.safeParse({
      name: "St. Anne's Children Home",
      region: "Greater Accra",
      description: "Dedicated to caring for vulnerable children.",
      sortOrder: 1,
      published: true,
    });
    assert.ok(valid.success);
  });

  it("validates outreach schema with date, title, and beneficiary count", () => {
    const valid = outreachSchema.safeParse({
      year: 2026,
      title: "Easter Giving Outreach 2026",
      summary: "Distributed food boxes and educational materials.",
      date: new Date("2026-04-05"),
      homesCount: 3,
      childrenReached: 150,
      upcoming: true,
    });
    assert.ok(valid.success);
  });

  it("validates gallery upload schema and metadata", () => {
    const validImage = newGalleryImageSchema.safeParse({
      publicId: "god-is-alive/gallery/sample123",
      url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
      width: 1200,
      height: 800,
      caption: "Distributing relief packages",
      year: 2026,
    });
    assert.ok(validImage.success);

    const validMeta = galleryMetaSchema.safeParse({
      caption: "Updated caption",
      year: 2026,
    });
    assert.ok(validMeta.success);
  });
});
