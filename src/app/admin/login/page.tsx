import type { Metadata } from "next";
import { Logo } from "@/components/ui/logo";
import { LoginForm } from "@/features/auth/components/login-form";

export const metadata: Metadata = { title: "Admin sign in", robots: { index: false } };

export default function LoginPage() {
  return (
    <main className="grid min-h-dvh place-items-center bg-sand p-4">
      <div className="w-full max-w-sm rounded-3xl bg-white p-8 shadow-[0_10px_30px_rgba(29,26,22,.08)]">
        <Logo className="mb-6 justify-center" />
        <h1 className="mb-1 text-center text-2xl">Admin sign in</h1>
        <p className="mb-6 text-center text-sm text-muted">Manage donations, gallery and more.</p>
        <LoginForm />
      </div>
    </main>
  );
}
