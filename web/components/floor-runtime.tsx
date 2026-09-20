"use client";

import { useEffect, useRef } from "react";
import { useDesk } from "@/lib/store";

export function FloorRuntime() {
  const { tickFloor } = useDesk();
  const tickRef = useRef(tickFloor);
  tickRef.current = tickFloor;

  useEffect(() => {
    const kick = window.setTimeout(() => tickRef.current(), 700);
    const id = window.setInterval(() => tickRef.current(), 3200);
    return () => {
      window.clearTimeout(kick);
      window.clearInterval(id);
    };
  }, []);

  return null;
}
