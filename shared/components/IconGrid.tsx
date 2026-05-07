import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

// Predefined SVG icon paths (24x24 viewBox)
const ICON_PATHS: Record<string, string> = {
  check:
    "M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z",
  star:
    "M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.27 5.82 22 7 14.14 2 9.27l6.91-1.01z",
  heart:
    "M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54z",
  lightning:
    "M7 2v11h3v9l7-12h-4l4-8z",
  shield:
    "M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5z",
  globe:
    "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z",
  users:
    "M16 11c1.66 0 2.99-1.34 2.99-3S17.66 5 16 5c-1.66 0-3 1.34-3 3s1.34 3 3 3zm-8 0c1.66 0 2.99-1.34 2.99-3S9.66 5 8 5C6.34 5 5 6.34 5 8s1.34 3 3 3zm0 2c-2.33 0-7 1.17-7 3.5V19h14v-2.5c0-2.33-4.67-3.5-7-3.5zm8 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.97 1.97 3.45V19h6v-2.5c0-2.33-4.67-3.5-7-3.5z",
  chart:
    "M3.5 18.49l6-6.01 4 4L22 6.92l-1.41-1.41-7.09 7.97-4-4L2 16.99z",
  gear:
    "M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58a.49.49 0 00.12-.61l-1.92-3.32a.49.49 0 00-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54a.484.484 0 00-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96a.49.49 0 00-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.07.62-.07.94s.02.64.07.94l-2.03 1.58a.49.49 0 00-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z",
  rocket:
    "M9.19 6.35c-2.04 2.29-3.44 5.58-3.57 5.89L2 10.69l4.05-4.05c.47-.47 1.15-.68 1.81-.55l1.33.26zM11.17 17s3.74-1.55 5.89-3.7c5.4-5.4 4.5-9.62 4.21-10.57-.95-.3-5.17-1.19-10.57 4.21C8.55 9.09 7 12.83 7 12.83zm6.48-3.56c-1.34 1.34-3.13 2.41-4.37 3.02l-2.74-2.74c.61-1.24 1.68-3.03 3.02-4.37 3.19-3.19 6.39-3.58 7.7-3.57.01 1.31-.38 4.51-3.61 7.66zM7.25 18.75c-.41.41-1.12.56-1.69.33-.57-.24-1.08-.68-1.32-1.32-.23-.57-.09-1.27.33-1.69.36-.36 1.04-.56 2.02-.6.21 0 .42.02.6.06.06.18.06.39.06.6-.04.98-.24 1.66-.6 2.02zM15 11c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z",
  lock:
    "M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1z",
  cloud:
    "M19.35 10.04C18.67 6.59 15.64 4 12 4 9.11 4 6.6 5.64 5.35 8.04 2.34 8.36 0 10.91 0 14c0 3.31 2.69 6 6 6h13c2.76 0 5-2.24 5-5 0-2.64-2.05-4.78-4.65-4.96z",
  code:
    "M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6z",
};

const ICON_NAMES = Object.keys(ICON_PATHS);

export const iconGridDataSchema = z.object({
  items: z.array(
    z.object({
      icon: z.string().describe(`Icon name: ${ICON_NAMES.join(", ")}, or a custom SVG path`),
      label: z.string(),
      description: z.string().default(""),
      color: zColor().optional().describe("Override icon color"),
    }),
  ),
  columns: z.number().default(3).describe("Number of columns"),
  iconSize: z.number().default(48).describe("Icon size in px"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type IconGridData = z.infer<typeof iconGridDataSchema>;

const IconSvg: React.FC<{ icon: string; size: number; color: string }> = ({
  icon,
  size,
  color,
}) => {
  const path = ICON_PATHS[icon] ?? icon;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d={path} />
    </svg>
  );
};

export const IconGrid: React.FC<IconGridData> = ({
  items,
  columns = 3,
  iconSize = 48,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gap: branding.spacing * 3,
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

        const scale = interpolate(progress, [0, 1], [0.7, 1]);
        const iconColor = item.color ?? branding.primaryColor;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: branding.spacing,
              opacity: progress,
              transform: `scale(${scale})`,
            }}
          >
            <IconSvg icon={item.icon} size={iconSize} color={iconColor} />
            <span
              style={{
                fontFamily: branding.headingFont,
                fontSize: branding.fontSizeBase,
                fontWeight: 700,
                color: branding.textColor,
                textAlign: "center",
              }}
            >
              {item.label}
            </span>
            {item.description && (
              <span
                style={{
                  fontFamily: branding.bodyFont,
                  fontSize: branding.fontSizeBase * 0.85,
                  color: branding.textColor,
                  opacity: 0.6,
                  textAlign: "center",
                  maxWidth: 220,
                }}
              >
                {item.description}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};
