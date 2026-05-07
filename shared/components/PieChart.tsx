import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile, delayRender, continueRender } from "remotion";
import { useBranding } from "../branding";
import { parseCsv } from "../utils";

export const pieChartDataSchema = z.object({
  dataFile: z.string().default("").describe("CSV/JSON file in public/ (columns: label, value)"),
  labelColumn: z.string().default("label").describe("CSV column for labels"),
  valueColumn: z.string().default("value").describe("CSV column for values"),
  segments: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      color: zColor().optional().describe("Override color for this segment"),
    }),
  ).default([]).describe("Inline data (alternative to dataFile)"),
  innerRadius: z.number().default(0).describe("Inner radius for donut (0 = full pie)"),
  showLabels: z.boolean().default(true),
  staggerDelay: z.number().default(8).describe("Frames between each segment's animation"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type PieChartData = z.infer<typeof pieChartDataSchema>;

const PIE_COLORS = (branding: { primaryColor: string; secondaryColor: string; accentColor: string }) => [
  branding.primaryColor,
  branding.secondaryColor,
  branding.accentColor,
  "#f59e0b",
  "#10b981",
  "#ec4899",
];

export const PieChart: React.FC<PieChartData> = ({
  dataFile = "",
  labelColumn = "label",
  valueColumn = "value",
  segments = [],
  innerRadius = 0,
  showLabels = true,
  staggerDelay = 8,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const colors = PIE_COLORS(branding);
  const durationFrames = duration * fps;

  const [loadedSegments, setLoadedSegments] = useState(segments);
  const [handle] = useState(() => (dataFile ? delayRender() : null));

  useEffect(() => {
    if (!dataFile) return;
    fetch(staticFile(dataFile))
      .then((res) => res.text())
      .then((text) => {
        let parsed: { label: string; value: number }[];
        if (dataFile.endsWith(".json")) {
          parsed = JSON.parse(text);
        } else {
          const rows = parseCsv(text);
          parsed = rows.map((r) => ({
            label: r[labelColumn] ?? "",
            value: parseFloat(r[valueColumn] ?? "0") || 0,
          }));
        }
        setLoadedSegments(parsed);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load data file:", err);
        if (handle !== null) continueRender(handle);
      });
  }, [dataFile, handle, labelColumn, valueColumn]);

  const activeSegments = dataFile ? loadedSegments : segments;

  const svgSize = 500;
  const center = svgSize / 2;
  const outerRadius = svgSize * 0.38;
  const resolvedInner = innerRadius * outerRadius;
  const midRadius = (outerRadius + resolvedInner) / 2;
  const strokeWidth = outerRadius - resolvedInner;

  const total = activeSegments.reduce((sum, s) => sum + s.value, 0);

  let cumulativeAngle = 0;

  return (
    <svg
      viewBox={`0 0 ${svgSize} ${svgSize}`}
      style={{ width: "100%", height: "100%" }}
    >
      {activeSegments.map((segment, i) => {
        const segmentAngle = (segment.value / total) * 360;
        const startAngle = cumulativeAngle;
        cumulativeAngle += segmentAngle;

        const circumference = 2 * Math.PI * midRadius;
        const segmentLength = (segment.value / total) * circumference;

        const segDelay = (i / activeSegments.length) * durationFrames * 0.4;
        const progress = interpolate(
          frame - animationDelay - segDelay,
          [0, durationFrames - segDelay],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const dashOffset = interpolate(progress, [0, 1], [segmentLength, 0]);
        const color = segment.color ?? colors[i % colors.length];

        // Label position at mid-angle, outside the pie
        const midAngle = startAngle + segmentAngle / 2;
        const labelRadius = outerRadius + 30;
        const labelX =
          center + labelRadius * Math.cos(((midAngle - 90) * Math.PI) / 180);
        const labelY =
          center + labelRadius * Math.sin(((midAngle - 90) * Math.PI) / 180);

        const labelOpacity = interpolate(
          progress,
          [0.5, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <g key={i}>
            <circle
              r={midRadius}
              cx={center}
              cy={center}
              fill="none"
              stroke={color}
              strokeWidth={strokeWidth}
              strokeDasharray={`${segmentLength} ${circumference}`}
              strokeDashoffset={dashOffset}
              transform={`rotate(${startAngle - 90} ${center} ${center})`}
            />
            {showLabels && (
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="central"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={13}
                fontWeight={500}
                opacity={labelOpacity}
              >
                {segment.label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
