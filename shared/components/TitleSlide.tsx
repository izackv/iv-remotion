import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { useBranding } from "../branding";

export const titleSlideDataSchema = z.object({
  heading: z.string().describe("Main title text"),
  subtitle: z.string().default("").describe("Subtitle text"),
  logoSrc: z.string().default("").describe("Logo image URL or static import path"),
  logoSize: z.number().default(80).describe("Logo height in px"),
  logoPosition: z
    .enum(["top-left", "top-right", "top-center", "bottom-center"])
    .default("top-left")
    .describe("Logo placement"),
  accentLine: z.boolean().default(true).describe("Show accent line under heading"),
  accentColor: zColor().optional().describe("Override accent line color"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type TitleSlideData = z.infer<typeof titleSlideDataSchema>;

export const TitleSlide: React.FC<TitleSlideData> = ({
  heading,
  subtitle = "",
  logoSrc = "",
  logoSize = 80,
  logoPosition = "top-left",
  accentLine = true,
  accentColor,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const accent = accentColor ?? branding.primaryColor;

  // 4 sequential phases: logo, heading, accent line, subtitle
  // Each takes 25% of the duration, spread so the last one ends at durationFrames
  const phaseLen = durationFrames * 0.3;
  const logoStart = 0;
  const headingStart = (durationFrames - phaseLen) * 0.2;
  const lineStart = (durationFrames - phaseLen) * 0.5;
  const subtitleStart = durationFrames - phaseLen;

  const logoProgress = interpolate(
    frame - animationDelay,
    [logoStart, logoStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const headingProgress = interpolate(
    frame - animationDelay,
    [headingStart, headingStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );
  const headingY = interpolate(headingProgress, [0, 1], [30, 0]);

  const lineProgress = interpolate(
    frame - animationDelay,
    [lineStart, lineStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
  );

  const subtitleProgress = interpolate(
    frame - animationDelay,
    [subtitleStart, subtitleStart + phaseLen],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const logoPositionStyle: React.CSSProperties = (() => {
    const base: React.CSSProperties = { position: "absolute" };
    switch (logoPosition) {
      case "top-left":
        return { ...base, top: 48, left: 56 };
      case "top-right":
        return { ...base, top: 48, right: 56 };
      case "top-center":
        return { ...base, top: 48, left: "50%", transform: "translateX(-50%)" };
      case "bottom-center":
        return { ...base, bottom: 48, left: "50%", transform: "translateX(-50%)" };
    }
  })();

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        backgroundColor: branding.backgroundColor,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: 80,
      }}
    >
      {/* Logo */}
      {logoSrc && (
        <div style={{ ...logoPositionStyle, opacity: logoProgress }}>
          <Img src={logoSrc} style={{ height: logoSize, objectFit: "contain" }} />
        </div>
      )}

      {/* Heading */}
      <h1
        style={{
          fontFamily: branding.headingFont,
          fontSize: branding.fontSizeXl * 1.4,
          fontWeight: 700,
          color: branding.textColor,
          textAlign: "center",
          margin: 0,
          opacity: headingProgress,
          transform: `translateY(${headingY}px)`,
          lineHeight: 1.15,
          maxWidth: "80%",
        }}
      >
        {heading}
      </h1>

      {/* Accent line */}
      {accentLine && (
        <div
          style={{
            width: 120 * lineProgress,
            height: 4,
            backgroundColor: accent,
            borderRadius: 2,
            marginTop: 24,
            marginBottom: 24,
          }}
        />
      )}

      {/* Subtitle */}
      {subtitle && (
        <p
          style={{
            fontFamily: branding.bodyFont,
            fontSize: branding.fontSizeLg,
            color: branding.textColor,
            opacity: subtitleProgress * 0.7,
            textAlign: "center",
            margin: 0,
            maxWidth: "65%",
            lineHeight: 1.5,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  );
};
