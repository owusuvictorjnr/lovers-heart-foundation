"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/card";
import type { Message } from "@/generated/prisma/client";
import { cn, formatDate } from "@/lib/utils";
import { deleteMessage, setMessageRead } from "../../actions";

export function MessageList({ messages }: { messages: Message[] }) {
  if (!messages.length) return <p className="py-10 text-center text-muted">No messages here.</p>;
  return <div className="grid gap-3">{messages.map((m) => <MessageCard key={m.id} message={m} />)}</div>;
}

function MessageCard({ message: m }: { message: Message }) {
  const [pending, start] = useTransition();
  const contactHref = m.contact.includes("@") ? `mailto:${m.contact}` : `tel:${m.contact.replace(/\s/g, "")}`;

  return (
    <article className={cn("rounded-2xl border bg-white p-5", m.read ? "border-line" : "border-gold shadow-sm")}>
      <header className="flex flex-wrap items-center gap-2">
        {!m.read && <Badge tone="gold">New</Badge>}
        <h3 className="font-sans text-base font-semibold">{m.name}</h3>
        <a href={contactHref} className="text-sm text-forest underline">{m.contact}</a>
        <Badge tone="gray">{m.topic}</Badge>
        <time className="ml-auto text-xs text-muted">{formatDate(m.createdAt, true)}</time>
      </header>
      <p className="mt-3 whitespace-pre-line text-[15px]">{m.body}</p>
      <div className="mt-3 flex justify-end gap-1">
        <Button size="sm" variant="subtle" disabled={pending} onClick={() => start(() => setMessageRead(m.id, !m.read))}>
          Mark as {m.read ? "unread" : "read"}
        </Button>
        <Button
          size="sm"
          variant="subtle"
          className="text-clay"
          disabled={pending}
          onClick={() => confirm("Delete this message?") && start(() => deleteMessage(m.id))}
        >
          Delete
        </Button>
      </div>
    </article>
  );
}
