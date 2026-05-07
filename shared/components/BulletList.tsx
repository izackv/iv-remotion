import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

export const bulletListDataSchema = z.object({
  items: z.array(
    z.object({
      text: z.string(),
      subtext: z.string().default("").describe("Optional smaller text below the item"),
    }),
  ),
  bulletStyle: z
    .enum(["dot", "number", "dash", "arrow", "check"])
    .default("dot")
    .describe("Bullet indicator style"),
  bulletColor: zColor().optional().describe("Override bullet color"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type BulletListData = z.infer<typeof bulletListDataSchema>;

const ARROW_D = "M10 17l5-5-5-5v10z";
const CHECK_D = "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z";

const BulletIcon: React.FC<{
  style: string;
  index: number;
  color: string;
  fontSize: number;
  font: string;
}> = ({ style: bulletStyle, index, color, fontSize, font }) => {
  switch (bulletStyle) {
    case "number":
      return (
        <span
          style={{
            fontFamily: font,
            fontSize: fontSize * 0.9,
            fontWeight: 700,
            color,
            minWidth: 28,
            fontVariantNumeric: "tabular-nums",
          }}
        >
          {index + 1}.
        </span>
      );
    case "dash":
      return (
        <span
          style={{
            fontFamily: font,
            fontSize,
            fontWeight: 700,
            color,
            minWidth: 20,
          }}
        >
          —
        </span>
      );
    case "arrow":
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, marginTop: 4 }}>
          <path d={ARROW_D} />
        </svg>
      );
    case "check":
      return (
        <svg width={18} height={18} viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0, marginTop: 4 }}>
          <path d={CHECK_D} />
        </svg>
      );
    default:
      return (
        <div
          style={{
            width: 10,
            height: 10,
            borderRadius: "50%",
            backgroundColor: color,
            flexShrink: 0,
            marginTop: 8,
          }}
        />
      );
  }
};

export const BulletList: React.FC<BulletListData> = ({
  items,
  bulletStyle = "dot",
  bulletColor,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;
  const color = bulletColor ?? branding.primaryColor;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 20,
        width: "100%",
      }}
    >
      {items.map((item, i) => {
        const itemAnimFrames = durationFrames * 0.3;
        const itemStart = (i / Math.max(items.length - 1, 1)) * (durationFrames - itemAnimFrames);
        const progress = interpolate(
          frame - animationDelay,
          [itemStart, itemStart + itemAnimFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
        );
        const translateX = interpolate(progress, [0, 1], [25, 0]);

        return (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 14,
              alignItems: "flex-start",
              opacity: progress,
              transform: `translateX(${translateX}px)`,
            }}
          >
            <BulletIcon
              style={bulletStyle}
              index={i}
              color={color}
              fontSize={branding.fontSizeBase}
              font={branding.bodyFont}
            />
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <span
                style={{
                  fontFamily: branding.bodyFont,
                  fontSize: branding.fontSizeLg,
                  color: branding.textColor,
                  lineHeight: 1.4,
                }}
              >
                {item.text}
              </span>
              {item.subtext && (
                <span
                  style={{
                    fontFamily: branding.bodyFont,
                    fontSize: branding.fontSizeBase * 0.9,
                    color: branding.textColor,
                    opacity: 0.55,
                    lineHeight: 1.4,
                  }}
                >
                  {item.subtext}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
