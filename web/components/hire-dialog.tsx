"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AgentAvatar } from "@/components/agent-avatar";
import { Button, Field, inputClass } from "@/components/ui";
import { avatarCatalog } from "@/lib/mock";
import { useDesk } from "@/lib/store";

const TOOL_OPTIONS = ["web", "scholar", "notes", "repo", "terminal", "ci", "compose", "listen", "schedule", "inbox", "calendar", "sheets", "drive"];

export function HireDialog({
  open,
  onClose,
  defaultDeskId,
}: {
  open: boolean;
  onClose: () => void;
  defaultDeskId?: string | null;
}) {
  const router = useRouter();
  const { desks, hireAgent } = useDesk();
  const [name, setName] = useState("");
  const [role, setRole] = useState("Research");
  const [deskId, setDeskId] = useState(defaultDeskId ?? "");
  const [prompt, setPrompt] = useState("Teammate. Human stays in charge — never silent-send.");
  const [tools, setTools] = useState<string[]>(["notes"]);
  const [avatarFile, setAvatarFile] = useState(avatarCatalog[0]?.file ?? "agent-001.png");
  const [model, setModel] = useState("Llama 3.3 70B");

  const picks = useMemo(() => avatarCatalog.slice(0, 24), []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <button type="button" className="absolute inset-0 bg-void/70" aria-label="Close" onClick={onClose} />
      <form
        className="relative max-h-[92dvh] w-full max-w-lg overflow-y-auto rounded-t-[20px] border border-line bg-panel p-5 sm:rounded-[20px]"
        onSubmit={(event) => {
          event.preventDefault();
          if (!name.trim()) return;
          const id = hireAgent({
            name: name.trim(),
            role,
            deskId: deskId || null,
            prompt,
            tools,
            avatarFile,
            model,
          });
          onClose();
          setName("");
          router.push(`/agents/${id}`);
        }}
      >
        <h2 className="font-headline text-2xl font-semibold">Hire agent</h2>
        <p className="mt-1 text-sm text-mist">
          Configure a seat, then wire the work graph. Tools are allowed; sends still hit Approvals.
        </p>
        <div className="mt-5 space-y-4">
          <Field label="Name">
            <input className={inputClass} value={name} onChange={(e) => setName(e.target.value)} placeholder="Lex-8" />
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Role">
              <input className={inputClass} value={role} onChange={(e) => setRole(e.target.value)} />
            </Field>
            <Field label="Desk">
              <select className={inputClass} value={deskId} onChange={(e) => setDeskId(e.target.value)}>
                <option value="">Bench (unseated)</option>
                {desks.map((desk) => (
                  <option key={desk.id} value={desk.id}>
                    {desk.name}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Model">
            <input className={inputClass} value={model} onChange={(e) => setModel(e.target.value)} />
          </Field>
          <Field label="Role prompt">
            <textarea
              className={`${inputClass} min-h-24 py-3`}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
            />
          </Field>
          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-mist">Tools allowed</legend>
            <div className="flex flex-wrap gap-2">
              {TOOL_OPTIONS.map((tool) => {
                const on = tools.includes(tool);
                return (
                  <button
                    key={tool}
                    type="button"
                    onClick={() =>
                      setTools((current) =>
                        on ? current.filter((item) => item !== tool) : [...current, tool],
                      )
                    }
                    className={`min-h-10 rounded-full px-3 font-mono text-xs ${
                      on ? "bg-signal text-void" : "border border-line text-mist"
                    }`}
                  >
                    {tool}
                  </button>
                );
              })}
            </div>
          </fieldset>
          <fieldset>
            <legend className="mb-2 text-xs font-medium uppercase tracking-wide text-mist">Avatar</legend>
            <div className="grid grid-cols-8 gap-2">
              {picks.map((avatar) => (
                <button
                  key={avatar.file}
                  type="button"
                  onClick={() => setAvatarFile(avatar.file)}
                  className={`rounded-full p-0.5 ${avatarFile === avatar.file ? "ring-2 ring-signal" : ""}`}
                >
                  <AgentAvatar file={avatar.file} name={avatar.file} size={36} />
                </button>
              ))}
            </div>
          </fieldset>
        </div>
        <div className="mt-6 flex gap-2">
          <Button type="submit" className="flex-1">
            Hire
          </Button>
          <Button variant="ghost" onClick={onClose} className="flex-1">
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
