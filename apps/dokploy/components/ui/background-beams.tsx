"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useRef } from "react";

export const BackgroundBeams = ({ className }: { className?: string }) => {
  const beamsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!beamsRef.current) return;

    const moveBeams = (e: MouseEvent) => {
      if (!beamsRef.current) return;

      const { clientX, clientY } = e;
      const x = (clientX / window.innerWidth) * 100;
      const y = (clientY / window.innerHeight) * 100;

      beamsRef.current.style.setProperty("--x", `${x}%`);
      beamsRef.current.style.setProperty("--y", `${y}%`);
    };

    window.addEventListener("mousemove", moveBeams);
    return () => window.removeEventListener("mousemove", moveBeams);
  }, []);

  return (
    <div
      ref={beamsRef}
      className={cn(
        "pointer-events-none fixed inset-0 z-0 h-full w-full bg-[radial-gradient(circle_at_var(--x,_50%)_var(--y,_50%),rgba(50,_50,_50,0.12)_0%,rgba(50,_50,_50,0.12)_15%,transparent_30%,transparent_100%)] opacity-70 transition-opacity duration-300",
        className
      )}
    />
  );
};
