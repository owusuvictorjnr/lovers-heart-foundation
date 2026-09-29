export interface HeroContent {
  badge: string;
  title: string;
  titleHighlight: string;
  description: string;
  images: string[];
  imageCaption: string;
  imageSubcaption: string;
}

export interface AboutValue {
  title: string;
  text: string;
}

export interface AboutContent {
  eyebrow: string;
  title: string;
  paragraph1: string;
  paragraph2: string;
  images: string[];
  imageBadge: string;
  imageCaption: string;
  quote: string;
  quoteAuthor: string;
  values: AboutValue[];
}

export interface OutreachContent {
  eyebrow: string;
  title: string;
  description: string;
  images: string[];
  imageTag: string;
  imageCaption: string;
  sponsorButtonText: string;
}
