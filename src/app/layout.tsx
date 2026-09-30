import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { Toaster } from "sonner";
import { siteConfig } from "@/config/site";
import { AppBody } from "@/components/layout/app-body";
import { SmoothScrollProvider } from "@/components/layout/smooth-scroll-provider";
import { ScrollProgressBar } from "@/components/layout/scroll-progress-bar";
import { BackToTop } from "@/components/layout/back-to-top";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const fraunces = Fraunces({ variable: "--font-fraunces", subsets: ["latin"], weight: ["600", "700"] });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: { default: `${siteConfig.name} | Caring for Children's Homes in Ghana`, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  icons: {
    icon: [
      { url: "/images/logo.jpg" },
    ],
    apple: [
      { url: "/images/logo.jpg" },
    ],
  },
  openGraph: { title: siteConfig.name, description: siteConfig.description, type: "website", locale: "en_GH" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${fraunces.variable}`} suppressHydrationWarning>
      <AppBody>
        <SmoothScrollProvider>
          <ScrollProgressBar />
          {children}
          <BackToTop />
          <Toaster position="bottom-center" richColors />
        </SmoothScrollProvider>
      </AppBody>
    </html>
  );
}
