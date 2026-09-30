"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";

type Props = {
  data: { amount: number; email: string; reference: string; confirmed: boolean } | null;
  onClose: () => void;
};

export function ThankYouDialog({ data, onClose }: Props) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    if (data) ref.current?.showModal();
    else ref.current?.close();
  }, [data]);

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(e) => e.target === ref.current && onClose()}
      className="m-auto max-w-md rounded-3xl p-0 text-center backdrop:bg-black/60"
    >
      {data && (
        <div className="px-8 py-10">
          <div className="text-5xl">💛</div>
          <h3 className="mt-2 mb-3 text-3xl">Thank you!</h3>
          <p className="text-muted">
            Your gift of <strong className="text-ink">GH₵ {data.amount.toLocaleString()}</strong> will help children in homes
            across Ghana. A receipt has been sent to {data.email}.
          </p>
          {!data.confirmed && (
            <p className="mt-3 text-sm text-muted">We&apos;re still confirming your payment. This usually takes a moment.</p>
          )}
          <p className="mt-3 text-xs text-muted">Reference: {data.reference}</p>
          <Button className="mt-6" onClick={onClose}>Close</Button>
        </div>
      )}
    </dialog>
  );
}
