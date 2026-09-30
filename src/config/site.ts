/**
 * Site-wide content that rarely changes.
 * Edit these values instead of hunting through components.
 */
export const siteConfig = {
  name: "Lovers Heart Foundation",
  motto: "Nyame Tumi So",
  tagline: "Bringing hope to children's homes across Ghana.",
  description:
    "Lovers Heart Foundation is a Ghanaian NGO that donates food, clothing, school supplies and love to children's homes across Ghana every year.",
  foundedYear: 2014, // [placeholder]
  contact: {
    address: "[Street / Area], Accra, Ghana",
    phone: "+233 24 000 0000",
    phoneHref: "tel:+233240000000",
    email: "info@loversheartfoundation.org",
    whatsapp: "233240000000", // international format, no +
  },
  socials: [
    { label: "Facebook", href: "#" },
    { label: "Instagram", href: "#" },
    { label: "TikTok", href: "#" },
  ],
  /** Manual giving options shown under the online donation form */
  directGiving: {
    reference: "LHF Donation",
    momo: [
      { network: "MTN MoMo", number: "024 000 0000", color: "#ffcc00", textColor: "#1d1a16", short: "MTN" },
      { network: "Telecel Cash", number: "020 000 0000", color: "#e30613", textColor: "#fff", short: "T" },
      { network: "AT Money", number: "027 000 0000", color: "#0066b3", textColor: "#fff", short: "AT" },
    ],
    bank: {
      bank: "[Bank Name], [Branch]",
      accountName: "Lovers Heart Foundation",
      accountNumber: "0000000000000",
    },
  },
  /** Preset amounts (GH₵) and what each can do: edit to match real costs */
  donationPresets: [50, 100, 200, 500, 1000],
  impactHints: [
    { min: 1000, text: "can stock a home's kitchen for a month." },
    { min: 500, text: "can provide school supplies for 10 children." },
    { min: 200, text: "can buy a bag of rice and cooking oil for a home." },
    { min: 100, text: "can provide toiletries for 5 children." },
    { min: 50, text: "can buy exercise books and pens for a child." },
  ],
} as const;

export const ghanaRegions = [
  "Ahafo", "Ashanti", "Bono", "Bono East", "Central", "Eastern", "Greater Accra",
  "North East", "Northern", "Oti", "Savannah", "Upper East", "Upper West",
  "Volta", "Western", "Western North",
] as const;
