import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

const columnSchema = z.object({
  heading: z.string().describe("Column heading"),
  items: z.array(z.string()).describe("List of items"),
  color: zColor().optional().describe("Override heading/icon color"),
});

export const twoColumnCompareDataSchema = z.object({
  left: columnSchema,
  right: columnSchema,
  variant: z
    .enum(["pros-cons", "before-after", "plain"])
    .default("plain")
    .describe("Visual style — pros-cons adds ✓/✗ icons, before-after adds arrow"),
  divider: z.boolean().default(true).describe("Show center divider line"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type TwoColumnCompareData = z.infer<typeof twoColumnCompareDataSchema>;

const CHECK_PATH = "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";
const CROSS_PATH = "M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z";
const ARROW_PATH = "M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z";

export const TwoColumnCompare: React.FC<TwoColumnCompareData> = ({
  left,
  right,
  variant = "plain",
  divider = true,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const leftColor = left.color ?? (variant === "pros-cons" ? "#3e8635" : branding.primaryColor);
  const rightColor = right.color ?? (variant === "pros-cons" ? "#c9190b" : branding.secondaryColor);

  const colAnimFrames = durationFrames * 0.35;

  // Left column slides in from left
  const leftProgress = interpolate(
    frame - animationDelay,
    [0, colAnimFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  // Right column slides in from right (starts slightly after left)
  const rightStart = durationFrames * 0.15;
  const rightProgress = interpolate(
    frame - animationDelay,
    [rightStart, rightStart + colAnimFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  // Divider / arrow
  const dividerStart = durationFrames * 0.2;
  const dividerProgress = interpolate(
    frame - animationDelay,
    [dividerStart, dividerStart + colAnimFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  const itemIcon = (side: "left" | "right") => {
    if (variant === "pros-cons") {
      const path = side === "left" ? CHECK_PATH : CROSS_PATH;
      const color = side === "left" ? leftColor : rightColor;
      return (
        <svg width={20} height={20} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, marginTop: 2 }}>
          <path d={path} />
        </svg>
      );
    }
    // Bullet for plain and before-after
    const color = side === "left" ? leftColor : rightColor;
    return (
      <div
        style={{
          width: 8,
          height: 8,
          borderRadius: "50%",
          backgroundColor: color,
          flexShrink: 0,
          marginTop: 8,
        }}
      />
    );
  };

  const renderColumn = (
    col: z.infer<typeof columnSchema>,
    side: "left" | "right",
    progress: number,
  ) => {
    const color = side === "left" ? leftColor : rightColor;
    const shift = side === "left" ? -30 : 30;
    const translateX = interpolate(progress, [0, 1], [shift, 0]);

    return (
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: 16,
          opacity: progress,
          transform: `translateX(${translateX}px)`,
        }}
      >
        <h2
          style={{
            fontFamily: branding.headingFont,
            fontSize: branding.fontSizeLg,
            fontWeight: 700,
            color,
            margin: 0,
            borderBottom: `3px solid ${color}`,
            paddingBottom: 10,
          }}
        >
          {col.heading}
        </h2>
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          {col.items.map((item, i) => {
            const itemAnimLen = durationFrames * 0.2;
            const baseStart = side === "left" ? colAnimFrames * 0.5 : rightStart + colAnimFrames * 0.5;
            const itemSpread = durationFrames - baseStart - itemAnimLen;
            const itemStart = baseStart + (i / Math.max(col.items.length - 1, 1)) * itemSpread;
            const itemProgress = interpolate(
              frame - animationDelay,
              [itemStart, itemStart + itemAnimLen],
              [0, 1],
              { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
            );

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  gap: 10,
                  alignItems: "flex-start",
                  opacity: itemProgress,
                  transform: `translateY(${interpolate(itemProgress, [0, 1], [8, 0])}px)`,
                }}
              >
                {itemIcon(side)}
                <span
                  style={{
                    fontFamily: branding.bodyFont,
                    fontSize: branding.fontSizeBase,
                    color: branding.textColor,
                    lineHeight: 1.5,
                  }}
                >
                  {item}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div
      style={{
        display: "flex",
        gap: 48,
        width: "100%",
        alignItems: "flex-start",
      }}
    >
      {renderColumn(left, "left", leftProgress)}

      {/* Center divider or arrow */}
      {divider && variant === "before-after" ? (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            alignSelf: "center",
            opacity: dividerProgress,
            transform: `scale(${interpolate(dividerProgress, [0, 1], [0.5, 1])})`,
          }}
        >
          <svg width={40} height={40} viewBox="0 0 24 24" fill={branding.primaryColor}>
            <path d={ARROW_PATH} />
          </svg>
        </div>
      ) : divider ? (
        <div
          style={{
            width: 2,
            alignSelf: "stretch",
            backgroundColor: branding.textColor,
            opacity: 0.12,
            transformOrigin: "top",
            transform: `scaleY(${dividerProgress})`,
          }}
        />
      ) : null}

      {renderColumn(right, "right", rightProgress)}
    </div>
  );
};
