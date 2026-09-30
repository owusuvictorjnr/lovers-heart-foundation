import Link from "next/link";
import { PageHeader } from "@/features/admin/components/page-header";
import { requireAdmin } from "@/features/auth/lib/session";
import { MessageList } from "@/features/messages/components/admin/message-list";
import { listMessages } from "@/features/messages/queries";
import { cn } from "@/lib/utils";

export const metadata = { title: "Messages" };

export default async function MessagesPage({ searchParams }: PageProps<"/admin/messages">) {
  await requireAdmin();
  const filter = (await searchParams).filter === "unread" ? "unread" : "all";
  const messages = await listMessages(filter);
  return (
    <>
      <PageHeader title="Messages" description="From the website contact form." />
      <div className="mb-4 flex gap-2 text-sm">
        {(["all", "unread"] as const).map((f) => (
          <Link key={f} href={f === "all" ? "?" : "?filter=unread"} className={cn("rounded-full border px-4 py-1.5 font-semibold capitalize", filter === f ? "border-forest bg-forest text-white" : "border-line bg-white")}>
            {f}
          </Link>
        ))}
      </div>
      <MessageList messages={messages} />
    </>
  );
}
