import React from "react";

export const VintageOverlay: React.FC<{
  width: number;
  height: number;
  vignetteOpacity?: number;
  grainOpacity?: number;
}> = ({ width, height, vignetteOpacity = 0.35, grainOpacity = 0.08 }) => (
  <>
    <div
      style={{
        position: "absolute",
        width,
        height,
        background: `radial-gradient(ellipse at center, transparent 40%, rgba(101, 67, 33, ${vignetteOpacity}) 100%)`,
        pointerEvents: "none",
      }}
    />
    <div
      style={{
        position: "absolute",
        width,
        height,
        opacity: grainOpacity,
        backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
        backgroundSize: "300px 300px",
        pointerEvents: "none",
      }}
    />
  </>
);
