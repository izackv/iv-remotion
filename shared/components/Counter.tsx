import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

export const counterDataSchema = z.object({
  value: z.number().describe("Target number to count up to"),
  prefix: z.string().default("").describe("Text before the number (e.g. '$')"),
  suffix: z.string().default("").describe("Text after the number (e.g. 'M', '%', 'K')"),
  label: z.string().default("").describe("Label below the number"),
  decimals: z.number().default(0).describe("Number of decimal places"),
  startFrom: z.number().default(0).describe("Starting number"),
  color: zColor().optional().describe("Override number color"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type CounterData = z.infer<typeof counterDataSchema>;

export const Counter: React.FC<CounterData> = ({
  value,
  prefix = "",
  suffix = "",
  label = "",
  decimals = 0,
  startFrom = 0,
  color,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const progress = interpolate(
    frame - animationDelay,
    [0, durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const current = startFrom + (value - startFrom) * progress;
  const formatted = current.toFixed(decimals);
  // Pre-compute the final formatted string so the container never changes size
  const finalFormatted = `${prefix}${value.toFixed(decimals)}${suffix}`;
  const numberColor = color ?? branding.primaryColor;
  const fontSize = branding.fontSizeXl * 1.5;

  const fadeIn = interpolate(
    frame - animationDelay,
    [0, 10],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 8,
        opacity: fadeIn,
      }}
    >
      <div
        style={{
          position: "relative",
          fontFamily: branding.headingFont,
          fontWeight: 700,
          fontSize,
          lineHeight: 1,
          fontVariantNumeric: "tabular-nums",
        }}
      >
        {/* Invisible final value to reserve the exact width */}
        <span style={{ visibility: "hidden" }}>{finalFormatted}</span>
        {/* Visible current value overlaid, right-aligned so digits don't jump */}
        <span
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            color: numberColor,
          }}
        >
          {prefix}
          {formatted}
          {suffix}
        </span>
      </div>
      {label && (
        <div
          style={{
            fontFamily: branding.bodyFont,
            fontSize: branding.fontSizeLg,
            color: branding.textColor,
            opacity: 0.7,
          }}
        >
          {label}
        </div>
      )}
    </div>
  );
};
