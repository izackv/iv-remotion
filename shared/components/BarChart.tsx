import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  useCurrentFrame,
  useVideoConfig,
  spring,
  interpolate,
  Easing,
  staticFile,
  delayRender,
  continueRender,
} from "remotion";
import { useBranding } from "../branding";
import { parseCsv } from "../utils";

export const barChartDataSchema = z.object({
  dataFile: z.string().default("").describe("CSV/JSON file in public/ (columns: label, value)"),
  labelColumn: z.string().default("label").describe("CSV column for labels"),
  valueColumn: z.string().default("value").describe("CSV column for values"),
  items: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
      color: zColor().optional().describe("Override color for this bar"),
    }),
  ).default([]).describe("Inline data (alternative to dataFile)"),
  maxValue: z.number().optional().describe("Max value for scaling (auto if omitted)"),
  staggerDelay: z.number().default(5).describe("Frames between each bar's animation"),
  showLabels: z.boolean().default(true),
  showValues: z.boolean().default(true),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type BarChartData = z.infer<typeof barChartDataSchema>;

const CHART_COLORS = (branding: { primaryColor: string; secondaryColor: string; accentColor: string }) => [
  branding.primaryColor,
  branding.secondaryColor,
  branding.accentColor,
];

export const BarChart: React.FC<BarChartData> = ({
  dataFile = "",
  labelColumn = "label",
  valueColumn = "value",
  items = [],
  maxValue,
  staggerDelay = 5,
  showLabels = true,
  showValues = true,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();

  const [loadedItems, setLoadedItems] = useState(items);
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
        setLoadedItems(parsed);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load data file:", err);
        if (handle !== null) continueRender(handle);
      });
  }, [dataFile, handle, labelColumn, valueColumn]);

  const activeItems = dataFile ? loadedItems : items;
  const resolvedMax = maxValue ?? Math.max(...activeItems.map((d) => d.value));
  const colors = CHART_COLORS(branding);
  const durationFrames = duration * fps;

  const padding = { top: 20, right: 40, bottom: showLabels ? 60 : 20, left: 60 };
  const svgWidth = 800;
  const svgHeight = 500;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  const barGap = 12;
  const barWidth = (chartWidth - barGap * (activeItems.length - 1)) / activeItems.length;

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Y-axis line */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke={branding.textColor}
        strokeWidth={1}
        strokeOpacity={0.3}
      />
      {/* X-axis line */}
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke={branding.textColor}
        strokeWidth={1}
        strokeOpacity={0.3}
      />

      {activeItems.map((item, i) => {
        const barDelay = (i / activeItems.length) * durationFrames * 0.4;
        const progress = interpolate(
          frame - animationDelay - barDelay,
          [0, durationFrames - barDelay],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        const barHeight = (item.value / resolvedMax) * chartHeight * progress;
        const x = padding.left + i * (barWidth + barGap);
        const y = padding.top + chartHeight - barHeight;
        const color = item.color ?? colors[i % colors.length];

        const labelOpacity = interpolate(
          progress,
          [0.3, 1],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <g key={i}>
            <rect
              x={x}
              y={y}
              width={barWidth}
              height={barHeight}
              fill={color}
              rx={branding.borderRadius}
            />
            {showLabels && (
              <text
                x={x + barWidth / 2}
                y={padding.top + chartHeight + 30}
                textAnchor="middle"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={14}
                opacity={labelOpacity}
              >
                {item.label}
              </text>
            )}
            {showValues && (
              <text
                x={x + barWidth / 2}
                y={y - 8}
                textAnchor="middle"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={13}
                fontWeight={700}
                opacity={labelOpacity}
              >
                {item.value}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
