import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import {
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  Easing,
  staticFile,
  delayRender,
  continueRender,
} from "remotion";
import { evolvePath } from "@remotion/paths";
import { useBranding } from "../branding";
import { parseCsv } from "../utils";

export const lineChartDataSchema = z.object({
  dataFile: z.string().default("").describe("CSV/JSON file in public/ (columns: label, value)"),
  labelColumn: z.string().default("label").describe("CSV column for labels"),
  valueColumn: z.string().default("value").describe("CSV column for values"),
  points: z.array(
    z.object({
      label: z.string(),
      value: z.number(),
    }),
  ).default([]).describe("Inline data (alternative to dataFile)"),
  lineColor: zColor().optional().describe("Override line color"),
  lineWidth: z.number().default(3),
  showDots: z.boolean().default(true),
  showLabels: z.boolean().default(true),
  showValues: z.boolean().default(true),
  showGrid: z.boolean().default(true),
  duration: z
    .number()
    .default(2)
    .describe("Animation duration in seconds"),
  animationDelay: z
    .number()
    .default(0)
    .describe("Delay before animation starts (frames)"),
});

export type LineChartData = z.infer<typeof lineChartDataSchema>;

export const LineChart: React.FC<LineChartData> = ({
  dataFile = "",
  labelColumn = "label",
  valueColumn = "value",
  points = [],
  lineColor,
  lineWidth = 3,
  showDots = true,
  showLabels = true,
  showValues = true,
  showGrid = true,
  duration = 2,
  animationDelay = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const [loadedPoints, setLoadedPoints] = useState(points);
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
        setLoadedPoints(parsed);
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load data file:", err);
        if (handle !== null) continueRender(handle);
      });
  }, [dataFile, handle, labelColumn, valueColumn]);

  const activePoints = dataFile ? loadedPoints : points;
  const branding = useBranding();
  const durationFrames = duration * fps;

  const color = lineColor ?? branding.primaryColor;

  const padding = { top: 30, right: 40, bottom: showLabels ? 50 : 20, left: 60 };
  const svgWidth = 800;
  const svgHeight = 500;
  const chartWidth = svgWidth - padding.left - padding.right;
  const chartHeight = svgHeight - padding.top - padding.bottom;

  if (activePoints.length < 2) {
    return (
      <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} style={{ width: "100%", height: "100%" }} />
    );
  }

  const maxValue = Math.max(...activePoints.map((p) => p.value));
  const minValue = Math.min(...activePoints.map((p) => p.value));
  const valueRange = maxValue - minValue || 1;

  // Map data points to SVG coordinates
  const coords = activePoints.map((p, i) => ({
    x: padding.left + (i / (activePoints.length - 1)) * chartWidth,
    y:
      padding.top +
      chartHeight -
      ((p.value - minValue) / valueRange) * chartHeight,
  }));

  // Build SVG path
  const pathD = coords
    .map((c, i) => `${i === 0 ? "M" : "L"} ${c.x} ${c.y}`)
    .join(" ");

  // Animate path drawing
  const progress = interpolate(
    frame - animationDelay,
    [0, durationFrames],
    [0, 1],
    {
      extrapolateLeft: "clamp",
      extrapolateRight: "clamp",
    },
  );

  const { strokeDasharray, strokeDashoffset } = evolvePath(progress, pathD);

  // Grid lines
  const gridLines = 5;
  const gridValues = Array.from({ length: gridLines }, (_, i) =>
    minValue + (valueRange * i) / (gridLines - 1),
  );

  return (
    <svg
      viewBox={`0 0 ${svgWidth} ${svgHeight}`}
      style={{ width: "100%", height: "100%" }}
    >
      {/* Grid */}
      {showGrid &&
        gridValues.map((val, i) => {
          const y =
            padding.top +
            chartHeight -
            ((val - minValue) / valueRange) * chartHeight;
          return (
            <g key={`grid-${i}`}>
              <line
                x1={padding.left}
                y1={y}
                x2={padding.left + chartWidth}
                y2={y}
                stroke={branding.textColor}
                strokeWidth={0.5}
                strokeOpacity={0.15}
              />
              <text
                x={padding.left - 8}
                y={y}
                textAnchor="end"
                dominantBaseline="central"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={11}
                opacity={0.5}
              >
                {Math.round(val)}
              </text>
            </g>
          );
        })}

      {/* Axes */}
      <line
        x1={padding.left}
        y1={padding.top}
        x2={padding.left}
        y2={padding.top + chartHeight}
        stroke={branding.textColor}
        strokeWidth={1}
        strokeOpacity={0.3}
      />
      <line
        x1={padding.left}
        y1={padding.top + chartHeight}
        x2={padding.left + chartWidth}
        y2={padding.top + chartHeight}
        stroke={branding.textColor}
        strokeWidth={1}
        strokeOpacity={0.3}
      />

      {/* Line */}
      <path
        d={pathD}
        fill="none"
        stroke={color}
        strokeWidth={lineWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeDasharray={strokeDasharray}
        strokeDashoffset={strokeDashoffset}
      />

      {/* Dots and labels */}
      {coords.map((c, i) => {
        // Show dot/label only when the line has reached this point
        const pointT = i / (activePoints.length - 1);
        const pointStart = Math.max(0, pointT - 0.05);
        const pointEnd = Math.max(pointStart + 0.001, pointT);
        const pointProgress = interpolate(
          progress,
          [pointStart, pointEnd],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
        );

        return (
          <g key={`dot-${i}`} opacity={pointProgress}>
            {showDots && (
              <>
                <circle cx={c.x} cy={c.y} r={5} fill={color} />
                <circle
                  cx={c.x}
                  cy={c.y}
                  r={3}
                  fill={branding.backgroundColor}
                />
              </>
            )}
            {showValues && (
              <text
                x={c.x}
                y={c.y - 14}
                textAnchor="middle"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={12}
                fontWeight={700}
              >
                {activePoints[i].value}
              </text>
            )}
            {showLabels && (
              <text
                x={c.x}
                y={padding.top + chartHeight + 24}
                textAnchor="middle"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={12}
              >
                {activePoints[i].label}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
};
