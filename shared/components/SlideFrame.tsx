import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing, Img } from "remotion";
import { useBranding } from "../branding";

export const slideFrameDataSchema = z.object({
  title: z.string().default("").describe("Header title"),
  subtitle: z.string().default("").describe("Smaller text next to or below the title"),
  logoSrc: z.string().default("").describe("Logo image URL or static path"),
  logoSize: z.number().default(48).describe("Logo height in px"),
  footer: z.string().default("").describe("Footer text (e.g. page number, date)"),
  footerRight: z.string().default("").describe("Right-aligned footer text"),
  accentLine: z.boolean().default(true).describe("Show accent line below header"),
  accentColor: zColor().optional().describe("Override accent line color"),
  contentPadding: z.number().default(48).describe("Padding around content area in px"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(1).describe("Frame entrance animation duration in seconds"),
});

export type SlideFrameData = z.infer<typeof slideFrameDataSchema>;

export const SlideFrame: React.FC<
  SlideFrameData & { children: React.ReactNode }
> = ({
  title = "",
  subtitle = "",
  logoSrc = "",
  logoSize = 48,
  footer = "",
  footerRight = "",
  accentLine = true,
  accentColor,
  contentPadding = 48,
  animationDelay = 0,
  duration = 1,
  children,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;
  const accent = accentColor ?? branding.primaryColor;

  // Header fades in first
  const headerProgress = interpolate(
    frame - animationDelay,
    [0, durationFrames * 0.5],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Accent line grows
  const lineProgress = interpolate(
    frame - animationDelay,
    [durationFrames * 0.2, durationFrames * 0.7],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Content area fades in
  const contentProgress = interpolate(
    frame - animationDelay,
    [durationFrames * 0.4, durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  // Footer fades in last
  const footerProgress = interpolate(
    frame - animationDelay,
    [durationFrames * 0.6, durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  const hasHeader = title || logoSrc;
  const hasFooter = footer || footerRight;

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        backgroundColor: branding.backgroundColor,
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      {hasHeader && (
        <div
          style={{
            padding: `${contentPadding}px ${contentPadding}px 0`,
            opacity: headerProgress,
            display: "flex",
            alignItems: "center",
            gap: 20,
            flexShrink: 0,
          }}
        >
          {logoSrc && (
            <Img
              src={logoSrc}
              style={{ height: logoSize, objectFit: "contain" }}
            />
          )}
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            {title && (
              <h1
                style={{
                  fontFamily: branding.headingFont,
                  fontSize: branding.fontSizeXl,
                  fontWeight: 700,
                  color: branding.textColor,
                  margin: 0,
                  lineHeight: 1.2,
                }}
              >
                {title}
              </h1>
            )}
            {subtitle && (
              <span
                style={{
                  fontFamily: branding.bodyFont,
                  fontSize: branding.fontSizeBase,
                  color: branding.textColor,
                  opacity: 0.6,
                }}
              >
                {subtitle}
              </span>
            )}
          </div>
        </div>
      )}

      {/* Accent line */}
      {accentLine && hasHeader && (
        <div
          style={{
            margin: `12px ${contentPadding}px 0`,
            height: 3,
            backgroundColor: accent,
            transformOrigin: "left",
            transform: `scaleX(${lineProgress})`,
            flexShrink: 0,
          }}
        />
      )}

      {/* Content area */}
      <div
        style={{
          flex: 1,
          padding: contentPadding,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          opacity: contentProgress,
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      {/* Footer */}
      {hasFooter && (
        <div
          style={{
            padding: `0 ${contentPadding}px ${contentPadding * 0.6}px`,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            opacity: footerProgress,
            flexShrink: 0,
          }}
        >
          <span
            style={{
              fontFamily: branding.bodyFont,
              fontSize: branding.fontSizeBase * 0.8,
              color: branding.textColor,
              opacity: 0.5,
            }}
          >
            {footer}
          </span>
          <span
            style={{
              fontFamily: branding.bodyFont,
              fontSize: branding.fontSizeBase * 0.8,
              color: branding.textColor,
              opacity: 0.5,
            }}
          >
            {footerRight}
          </span>
        </div>
      )}
    </div>
  );
};
