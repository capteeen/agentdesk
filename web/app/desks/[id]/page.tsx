"use client";

import { useParams } from "next/navigation";
import { DeskBoard } from "@/components/desk-board";

export default function DeskPage() {
  const params = useParams<{ id: string }>();
  return <DeskBoard deskId={params.id} />;
}
