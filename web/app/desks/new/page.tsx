"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Field, inputClass } from "@/components/ui";
import { useDesk } from "@/lib/store";
import type { DeskKind } from "@/lib/types";

const KINDS: { id: DeskKind; label: string; blurb: string }[] = [
  { id: "research", label: "Research", blurb: "Deep research and synthesis." },
  { id: "build", label: "Build", blurb: "Code, test, and ship software." },
  { id: "social", label: "Social", blurb: "Engage, monitor, and respond." },
  { id: "ops", label: "Ops", blurb: "Operations and workflow automation." },
];

export default function NewDeskPage() {
  const router = useRouter();
  const { addDesk } = useDesk();
  const [name, setName] = useState("");
  const [kind, setKind] = useState<DeskKind>("research");
  const [blurb, setBlurb] = useState(KINDS[0].blurb);

  return (
    <div className="mx-auto max-w-xl space-y-6">
      <header>
        <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-mist">New desk</p>
        <h1 className="mt-2 font-headline text-3xl font-semibold tracking-tight">Open a desk</h1>
        <p className="mt-2 text-sm text-mist">
          A desk is a team with seats, a queue, and an approvals lane — not another chat thread.
        </p>
      </header>
      <form
        className="ad-card space-y-5 p-5"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          const id = addDesk({ name: name.trim(), kind, blurb });
          router.push(`/desks/${id}`);
        }}
      >
        <Field label="Name">
          <input
            className={inputClass}
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Research"
          />
        </Field>
        <fieldset>
          <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-mist">Kind</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {KINDS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setKind(item.id);
                  setBlurb(item.blurb);
                }}
                className={`min-h-16 rounded-[12px] border px-3 py-2 text-left ${
                  kind === item.id ? "border-signal bg-signal/10" : "border-line bg-void"
                }`}
              >
                <div className="text-sm font-medium">{item.label}</div>
                <div className="text-xs text-mist">{item.blurb}</div>
              </button>
            ))}
          </div>
        </fieldset>
        <Field label="Brief">
          <textarea
            className={`${inputClass} min-h-24 py-3`}
            value={blurb}
            onChange={(event) => setBlurb(event.target.value)}
          />
        </Field>
        <Button type="submit" className="w-full">
          Open desk
        </Button>
      </form>
    </div>
  );
}
