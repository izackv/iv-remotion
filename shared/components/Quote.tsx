import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

export const quoteDataSchema = z.object({
  text: z.string().describe("Quote or callout text"),
  attribution: z.string().default("").describe("Author or source"),
  accentColor: zColor().optional().describe("Override accent bar color"),
  variant: z
    .enum(["left-bar", "top-bar", "large-quote"])
    .default("left-bar")
    .describe("Visual style"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type QuoteData = z.infer<typeof quoteDataSchema>;

export const Quote: React.FC<QuoteData> = ({
  text,
  attribution = "",
  accentColor,
  variant = "left-bar",
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;
  const accent = accentColor ?? branding.primaryColor;

  // 3 sequential phases, last one ends at durationFrames
  const phaseLen = durationFrames * 0.35;
  const barStart = 0;
  const textStart = (durationFrames - phaseLen) * 0.35;
  const attrStart = durationFrames - phaseLen;

  // Bar grows in
  const barProgress = interpolate(
    frame - animationDelay,
    [barStart, barStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  // Text fades in
  const textProgress = interpolate(
    frame - animationDelay,
    [textStart, textStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );
  const textShift = interpolate(textProgress, [0, 1], [15, 0]);

  // Attribution fades in last
  const attrProgress = interpolate(
    frame - animationDelay,
    [attrStart, attrStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (variant === "large-quote") {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 20,
          maxWidth: 900,
        }}
      >
        {/* Large quotation mark */}
        <span
          style={{
            fontFamily: "Georgia, serif",
            fontSize: 120,
            color: accent,
            lineHeight: 0.6,
            opacity: barProgress,
            transform: `scale(${interpolate(barProgress, [0, 1], [0.5, 1])})`,
          }}
        >
          {"\u201C"}
        </span>
        <p
          style={{
            fontFamily: branding.headingFont,
            fontSize: branding.fontSizeLg * 1.2,
            color: branding.textColor,
            textAlign: "center",
            lineHeight: 1.5,
            margin: 0,
            fontStyle: "italic",
            opacity: textProgress,
            transform: `translateY(${textShift}px)`,
          }}
        >
          {text}
        </p>
        {attribution && (
          <span
            style={{
              fontFamily: branding.bodyFont,
              fontSize: branding.fontSizeBase,
              color: accent,
              fontWeight: 600,
              opacity: attrProgress,
            }}
          >
            — {attribution}
          </span>
        )}
      </div>
    );
  }

  const isTop = variant === "top-bar";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: isTop ? "column" : "row",
        gap: isTop ? 16 : 24,
        maxWidth: 800,
      }}
    >
      {/* Accent bar */}
      <div
        style={{
          backgroundColor: accent,
          borderRadius: 2,
          flexShrink: 0,
          ...(isTop
            ? {
                width: 80 * barProgress,
                height: 4,
              }
            : {
                width: 5,
                height: "auto",
                alignSelf: "stretch",
                transformOrigin: "top",
                transform: `scaleY(${barProgress})`,
              }),
        }}
      />
      {/* Content */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: 12,
          opacity: textProgress,
          transform: isTop
            ? `translateY(${textShift}px)`
            : `translateX(${textShift}px)`,
        }}
      >
        <p
          style={{
            fontFamily: branding.headingFont,
            fontSize: branding.fontSizeLg,
            color: branding.textColor,
            lineHeight: 1.5,
            margin: 0,
          }}
        >
          {text}
        </p>
        {attribution && (
          <span
            style={{
              fontFamily: branding.bodyFont,
              fontSize: branding.fontSizeBase,
              color: accent,
              fontWeight: 600,
              opacity: attrProgress / textProgress || 0,
            }}
          >
            — {attribution}
          </span>
        )}
      </div>
    </div>
  );
};
