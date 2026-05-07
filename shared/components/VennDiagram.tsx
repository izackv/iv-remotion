import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

export const vennDiagramDataSchema = z.object({
  circles: z
    .array(
      z.object({
        label: z.string(),
        color: zColor().optional().describe("Override color for this circle"),
      }),
    )
    .min(2)
    .max(3),
  overlapLabel: z.string().default("").describe("Label for the overlap area"),
  overlapAmount: z
    .number()
    .default(0.35)
    .describe("How much circles overlap (0-1)"),
  circleRadius: z.number().default(150).describe("Radius of each circle"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type VennDiagramData = z.infer<typeof vennDiagramDataSchema>;

export const VennDiagram: React.FC<VennDiagramData> = ({
  circles,
  overlapLabel = "",
  overlapAmount = 0.35,
  circleRadius = 150,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const defaultColors = [
    branding.primaryColor,
    branding.secondaryColor,
    branding.accentColor,
  ];

  const svgWidth = 800;
  const svgHeight = 500;
  const centerX = svgWidth / 2;
  const centerY = svgHeight / 2;

  const diameter = circleRadius * 2;
  const overlap = diameter * overlapAmount;
  const totalWidth =
    circles.length === 2
      ? diameter * 2 - overlap
      : diameter * 2 - overlap; // 3 circles arranged in triangle

  // Compute circle centers
  const positions: { x: number; y: number; startX: number }[] = [];
  if (circles.length === 2) {
    const left = centerX - (totalWidth / 2) + circleRadius;
    const right = left + diameter - overlap;
    positions.push(
      { x: left, y: centerY, startX: -svgWidth * 0.3 },
      { x: right, y: centerY, startX: svgWidth * 1.3 },
    );
  } else {
    // 3 circles: top-left, top-right, bottom-center
    const dx = (diameter - overlap) / 2;
    const dy = (diameter - overlap) * 0.45;
    positions.push(
      { x: centerX - dx, y: centerY - dy * 0.5, startX: -svgWidth * 0.3 },
      { x: centerX + dx, y: centerY - dy * 0.5, startX: svgWidth * 1.3 },
      { x: centerX, y: centerY + dy * 0.5, startX: centerX },
    );
    // For the third circle, animate from below
    positions[2].startX = centerX;
  }

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ width: "100%", height: "100%" }}
    >
      {circles.map((circle, i) => {
        const circleDelay = (i / circles.length) * durationFrames * 0.3;
        const progress = interpolate(
          frame - animationDelay - circleDelay,
          [0, durationFrames - circleDelay],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const pos = positions[i];
        const color = circle.color ?? defaultColors[i % defaultColors.length];

        // Animate from off-screen to final position
        let currentX: number;
        let currentY: number;
        if (circles.length === 3 && i === 2) {
          // Third circle slides up from below
          currentX = pos.x;
          currentY = interpolate(progress, [0, 1], [svgHeight + circleRadius, pos.y]);
        } else {
          currentX = interpolate(progress, [0, 1], [pos.startX, pos.x]);
          currentY = pos.y;
        }

        const labelOpacity = interpolate(
          progress,
          [0.7, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        // Position label inside the circle, shifted away from the overlap zone
        // so text stays clear of all circle edges.
        const inset = circleRadius * 0.45;
        let labelX = currentX;
        let labelY = currentY;
        if (circles.length === 2) {
          // Shift left circle's label left, right circle's label right
          labelX = currentX + (i === 0 ? -inset : inset);
        } else {
          // 3 circles: push each label away from the shared center
          const finalPos = positions[i];
          const dx = finalPos.x - centerX;
          const dy = finalPos.y - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          labelX = currentX + (dx / dist) * inset;
          labelY = currentY + (dy / dist) * inset;
        }

        return (
          <g key={i}>
            <circle
              cx={currentX}
              cy={currentY}
              r={circleRadius}
              fill={color}
              fillOpacity={0.35}
              stroke={color}
              strokeWidth={2}
              strokeOpacity={0.6}
            />
            <text
              x={labelX}
              y={labelY}
              textAnchor="middle"
              dominantBaseline="central"
              fill={branding.textColor}
              fontFamily={branding.bodyFont}
              fontSize={16}
              fontWeight={700}
              opacity={labelOpacity}
            >
              {circle.label}
            </text>
          </g>
        );
      })}

      {/* Overlap label */}
      {overlapLabel && (
        <text
          x={centerX}
          y={circles.length === 2 ? centerY : centerY}
          textAnchor="middle"
          dominantBaseline="central"
          fill={branding.textColor}
          fontFamily={branding.bodyFont}
          fontSize={14}
          fontWeight={500}
          opacity={interpolate(
            frame - animationDelay,
            [durationFrames * 0.7, durationFrames],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
          )}
        >
          {overlapLabel}
        </text>
      )}
    </svg>
  );
};
