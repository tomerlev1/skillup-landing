"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

const SOURCE_W = 760;
const SOURCE_H = 1652;

interface Screen {
  src: string;
  alt: string;
}

interface Props {
  screens: readonly Screen[];
  width?: number;
  interval?: number;
  className?: string;
}

// Fades between a list of real iOS screenshots inside one device bezel.
// Used in the hero. Respects prefers-reduced-motion via CSS globals.
export default function RealAppFrameCycling({
  screens,
  width = 280,
  interval = 4200,
  className = "",
}: Props) {
  const [idx, setIdx] = useState(0);
  const height = Math.round((width * SOURCE_H) / SOURCE_W);

  useEffect(() => {
    if (screens.length <= 1) return;
    const id = window.setInterval(() => {
      setIdx((i) => (i + 1) % screens.length);
    }, interval);
    return () => window.clearInterval(id);
  }, [screens.length, interval]);

  return (
    <div
      className={`relative overflow-hidden rounded-[2.5rem] bg-black p-1.5 shadow-[0_40px_80px_-30px_rgba(10,10,15,0.35),0_10px_30px_-12px_rgba(10,10,15,0.2)] ring-1 ring-black/10 ${className}`}
      style={{ width: width + 12 }}
    >
      <div
        className="relative overflow-hidden rounded-[2rem] bg-white"
        style={{ width, height }}
      >
        {screens.map((s, i) => (
          <Image
            key={s.src}
            src={s.src}
            alt={s.alt}
            width={width}
            height={height}
            priority={i === 0}
            className="absolute inset-0 h-full w-full object-cover transition-[opacity,transform] duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
            style={{
              opacity: i === idx ? 1 : 0,
              transform: i === idx ? "translateY(0)" : "translateY(12px)",
            }}
          />
        ))}
      </div>
    </div>
  );
}
