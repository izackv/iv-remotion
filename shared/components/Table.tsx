import React, { useEffect, useState } from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, staticFile, delayRender, continueRender } from "remotion";
import { useBranding } from "../branding";
import { parseCsv } from "../utils";

export const tableDataSchema = z.object({
  dataFile: z.string().default("").describe("CSV file in public/ (first row = headers)"),
  headers: z.array(z.string()).default([]).describe("Column headers (auto from CSV if using dataFile)"),
  rows: z.array(z.array(z.string())).default([]).describe("Row data (auto from CSV if using dataFile)"),
  highlightColor: zColor().optional().describe("Alternating row tint color"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type TableData = z.infer<typeof tableDataSchema>;

export const Table: React.FC<TableData> = ({
  dataFile = "",
  headers = [],
  rows = [],
  highlightColor,
  animationDelay = 0,
  duration = 2,
}) => {
  const [activeHeaders, setActiveHeaders] = useState(headers);
  const [activeRows, setActiveRows] = useState(rows);
  const [handle] = useState(() => (dataFile ? delayRender() : null));

  useEffect(() => {
    if (!dataFile) return;
    fetch(staticFile(dataFile))
      .then((res) => res.text())
      .then((text) => {
        const parsed = parseCsv(text);
        if (parsed.length > 0) {
          const csvHeaders = Object.keys(parsed[0]);
          const csvRows = parsed.map((r) => csvHeaders.map((h) => r[h] ?? ""));
          setActiveHeaders(csvHeaders);
          setActiveRows(csvRows);
        }
        if (handle !== null) continueRender(handle);
      })
      .catch((err) => {
        console.error("Failed to load data file:", err);
        if (handle !== null) continueRender(handle);
      });
  }, [dataFile, handle]);

  const resolvedHeaders = dataFile ? activeHeaders : headers;
  const resolvedRows = dataFile ? activeRows : rows;
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const tint = highlightColor ?? `${branding.primaryColor}0d`;

  const headerAnimFrames = durationFrames * 0.15;

  // Header fades in first
  const headerOpacity = interpolate(
    frame - animationDelay,
    [0, headerAnimFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div style={{ width: "100%", overflow: "hidden" }}>
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontFamily: branding.bodyFont,
          color: branding.textColor,
          fontSize: branding.fontSizeBase,
        }}
      >
        <thead>
          <tr
            style={{
              opacity: headerOpacity,
              borderBottom: `2px solid ${branding.primaryColor}`,
            }}
          >
            {resolvedHeaders.map((h, i) => (
              <th
                key={i}
                style={{
                  padding: "12px 16px",
                  textAlign: "left",
                  fontWeight: 700,
                  fontSize: branding.fontSizeBase * 1.05,
                  fontFamily: branding.headingFont,
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {resolvedRows.map((row, rowIdx) => {
            const rowAnimFrames = durationFrames * 0.2;
            const rowStart = headerAnimFrames + (rowIdx / Math.max(resolvedRows.length - 1, 1)) * (durationFrames - headerAnimFrames - rowAnimFrames);
            const rowProgress = interpolate(
              frame - animationDelay,
              [rowStart, rowStart + rowAnimFrames],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
            );

            const translateY = interpolate(rowProgress, [0, 1], [12, 0]);

            return (
              <tr
                key={rowIdx}
                style={{
                  opacity: rowProgress,
                  transform: `translateY(${translateY}px)`,
                  backgroundColor: rowIdx % 2 === 1 ? tint : "transparent",
                  borderBottom: `1px solid ${branding.textColor}15`,
                }}
              >
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    style={{
                      padding: "10px 16px",
                      fontWeight: colIdx === 0 ? 500 : 400,
                    }}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};
