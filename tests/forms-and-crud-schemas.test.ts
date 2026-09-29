import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { contactSchema } from "../src/features/messages/schemas";
import { volunteerSchema } from "../src/features/volunteers/schemas";
import { homeSchema } from "../src/features/homes/schemas";
import { outreachSchema } from "../src/features/outreach/schemas";
import { galleryMetaSchema, newGalleryImageSchema } from "../src/features/gallery/schemas";
import {
  imagesJsonSchema,
  heroContentSchema,
  aboutContentSchema,
  outreachContentSchema,
} from "../src/features/content/schemas";

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
      publicId: "lovers-heart-foundation/gallery/sample123",
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

  it("validates imagesJson schema strictly with Cloudinary URL whitelist and max count", () => {
    const validList = JSON.stringify([
      "https://res.cloudinary.com/my-cloud/image/upload/v1234/hero1.jpg",
      "https://res.cloudinary.com/my-cloud/image/upload/v1234/hero2.jpg",
    ]);
    const validParse = imagesJsonSchema.safeParse(validList);
    assert.ok(validParse.success);
    assert.equal(validParse.data.length, 2);
    assert.equal(validParse.data[0], "https://res.cloudinary.com/my-cloud/image/upload/v1234/hero1.jpg");

    // Empty list is valid
    const emptyParse = imagesJsonSchema.safeParse("[]");
    assert.ok(emptyParse.success);
    assert.deepEqual(emptyParse.data, []);

    // Reject non-JSON
    const invalidJson = imagesJsonSchema.safeParse("not a json string");
    assert.ok(!invalidJson.success);

    // Reject non-array JSON
    const objectJson = imagesJsonSchema.safeParse(JSON.stringify({ url: "https://res.cloudinary.com/img.jpg" }));
    assert.ok(!objectJson.success);

    // Reject external / unapproved image domains
    const evilDomain = imagesJsonSchema.safeParse(JSON.stringify(["https://evil-tracking-site.com/logger.png"]));
    assert.ok(!evilDomain.success);

    // Reject insecure http: protocol
    const insecureHttp = imagesJsonSchema.safeParse(JSON.stringify(["http://res.cloudinary.com/img.jpg"]));
    assert.ok(!insecureHttp.success);

    // Reject more than 8 images
    const oversized = imagesJsonSchema.safeParse(
      JSON.stringify(Array.from({ length: 9 }, (_, i) => `https://res.cloudinary.com/demo/img${i}.jpg`)),
    );
    assert.ok(!oversized.success);
  });

  it("validates full hero, about, and outreach CMS schemas", () => {
    const validHero = heroContentSchema.safeParse({
      badge: "Hope & Care",
      title: "Bringing smiles to children",
      titleHighlight: "across Ghana",
      description: "We are committed to helping orphanages.",
      imagesJson: JSON.stringify(["https://res.cloudinary.com/cloud/image/upload/hero.jpg"]),
      imageCaption: "Volunteers at Accra Outreach",
      imageSubcaption: "December 2025",
    });
    assert.ok(validHero.success);
    assert.deepEqual(validHero.data.imagesJson, ["https://res.cloudinary.com/cloud/image/upload/hero.jpg"]);

    const validAbout = aboutContentSchema.safeParse({
      eyebrow: "Our Mission",
      title: "Empowering communities",
      paragraph1: "Paragraph one details.",
      paragraph2: "Paragraph two details.",
      imagesJson: "[]",
      imageBadge: "Registered NGO",
      imageCaption: "Community outreach",
      quote: "Every child deserves love.",
      quoteAuthor: "Founder",
      value1Title: "Love",
      value1Text: "Unconditional care",
      value2Title: "Integrity",
      value2Text: "100% transparency",
      value3Title: "Impact",
      value3Text: "Sustainable help",
    });
    assert.ok(validAbout.success);

    const validOutreach = outreachContentSchema.safeParse({
      eyebrow: "Our Journey",
      title: "Reaching 10+ homes",
      description: "Our mission to bring food and aid.",
      imagesJson: "[]",
      imageTag: "Direct Aid",
      imageCaption: "Handover ceremony",
      sponsorButtonText: "Donate Now",
    });
    assert.ok(validOutreach.success);
  });
});
