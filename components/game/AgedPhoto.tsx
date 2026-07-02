"use client";

// AgedPhoto — renders a photo as an old, sepia-toned, scratched print.
// Used for the YOURSELVES boss (the team's own ritual photo, "found" decades later)
// and the culprit reveal.

import { CSSProperties } from "react";

// Film grain as an inline SVG (fractal noise), tiled.
const GRAIN_URI =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='160' height='160' filter='url(%23n)' opacity='0.55'/%3E%3C/svg%3E";

export function AgedPhoto({
  src,
  alt,
  className,
  style,
  imgStyle,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  imgStyle?: CSSProperties;
}) {
  return (
    <div
      className={`relative overflow-hidden ${className ?? ""}`}
      style={style}
    >
      {/* The photo itself — sepia, faded, slightly soft like an old print */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover object-center"
        style={{
          filter:
            "sepia(0.78) contrast(1.12) brightness(0.8) saturate(0.7) blur(0.4px)",
          ...imgStyle,
        }}
      />

      {/* Film grain */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          backgroundImage: `url("${GRAIN_URI}")`,
          opacity: 0.32,
          mixBlendMode: "overlay",
        }}
      />

      {/* Scratch marks — thin, slightly tilted light streaks */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: [
            "linear-gradient(83deg, transparent 12.4%, rgba(255,246,222,0.30) 12.52%, transparent 12.68%)",
            "linear-gradient(95deg, transparent 31.2%, rgba(255,246,222,0.14) 31.30%, transparent 31.44%)",
            "linear-gradient(88deg, transparent 57.1%, rgba(255,240,210,0.24) 57.20%, transparent 57.38%)",
            "linear-gradient(79deg, transparent 71.6%, rgba(255,246,222,0.10) 71.70%, transparent 71.82%)",
            "linear-gradient(92deg, transparent 86.3%, rgba(255,246,222,0.20) 86.40%, transparent 86.55%)",
            "linear-gradient(4deg, transparent 22.5%, rgba(255,240,214,0.10) 22.62%, transparent 22.78%)",
          ].join(","),
          mixBlendMode: "screen",
        }}
      />

      {/* Chemical stain / light leak in one corner */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(circle at 88% 8%, rgba(200,140,40,0.28) 0%, transparent 32%), radial-gradient(circle at 6% 92%, rgba(120,70,20,0.22) 0%, transparent 26%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* Vignette + worn edges */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 42%, rgba(28,14,0,0.55) 100%)",
          boxShadow: "inset 0 0 46px rgba(35,18,0,0.6)",
        }}
      />
    </div>
  );
}
