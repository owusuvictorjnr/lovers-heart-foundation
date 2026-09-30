import { ButtonLink } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center p-6 text-center">
      <div>
        <p className="eyebrow">404</p>
        <h1 className="text-4xl">Page not found</h1>
        <p className="mt-2 mb-6 text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <ButtonLink href="/">Back to home</ButtonLink>
      </div>
    </main>
  );
}
