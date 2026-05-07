import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

export const timelineDataSchema = z.object({
  milestones: z.array(
    z.object({
      title: z.string(),
      description: z.string().default(""),
      date: z.string().default("").describe("Date or label (e.g. 'Q1 2025')"),
      color: zColor().optional().describe("Override dot color"),
    }),
  ),
  variant: z.enum(["horizontal", "vertical"]).default("vertical"),
  animationDelay: z.number().default(0).describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type TimelineData = z.infer<typeof timelineDataSchema>;

export const Timeline: React.FC<TimelineData> = ({
  milestones,
  variant = "vertical",
  animationDelay = 0,
  duration = 2,
}) => {
  if (variant === "horizontal") {
    return (
      <HorizontalTimeline
        milestones={milestones}
        animationDelay={animationDelay}
        duration={duration}
      />
    );
  }
  return (
    <VerticalTimeline
      milestones={milestones}
      animationDelay={animationDelay}
      duration={duration}
    />
  );
};

const VerticalTimeline: React.FC<{
  milestones: TimelineData["milestones"];
  animationDelay: number;
  duration: number;
}> = ({ milestones, animationDelay, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const dotSize = 16;
  const lineWidth = 3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: 0,
        position: "relative",
        paddingLeft: dotSize / 2 + 24,
      }}
    >
      {milestones.map((m, i) => {
        const itemAnimFrames = durationFrames * 0.3;
        const itemStart = (i / Math.max(milestones.length - 1, 1)) * (durationFrames - itemAnimFrames);
        const progress = interpolate(
          frame - animationDelay,
          [itemStart, itemStart + itemAnimFrames],
          [0, 1],
          { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
        );

        // Line grows shortly after the milestone appears
        const lineProgress =
          i < milestones.length - 1
            ? interpolate(
                frame - animationDelay,
                [itemStart + itemAnimFrames * 0.3, itemStart + itemAnimFrames],
                [0, 1],
                { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
              )
            : 0;

        const dotColor = m.color ?? branding.primaryColor;
        const isLast = i === milestones.length - 1;

        return (
          <div
            key={i}
            style={{
              display: "flex",
              flexDirection: "row",
              alignItems: "flex-start",
              position: "relative",
              paddingBottom: isLast ? 0 : 40,
              opacity: progress,
              transform: `translateX(${interpolate(progress, [0, 1], [20, 0])}px)`,
            }}
          >
            {/* Dot */}
            <div
              style={{
                position: "absolute",
                left: -(dotSize / 2 + 24),
                top: 4,
                width: dotSize,
                height: dotSize,
                borderRadius: "50%",
                backgroundColor: dotColor,
                border: `3px solid ${branding.backgroundColor}`,
                boxShadow: `0 0 0 2px ${dotColor}`,
                zIndex: 2,
              }}
            />
            {/* Connecting line */}
            {!isLast && (
              <div
                style={{
                  position: "absolute",
                  left: -(dotSize / 2 + 24) + dotSize / 2 - lineWidth / 2,
                  top: 4 + dotSize,
                  width: lineWidth,
                  height: `calc(100% - ${dotSize}px)`,
                  backgroundColor: branding.primaryColor,
                  opacity: 0.3,
                  transformOrigin: "top",
                  transform: `scaleY(${lineProgress})`,
                }}
              />
            )}
            {/* Content */}
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {m.date && (
                <span
                  style={{
                    fontFamily: branding.bodyFont,
                    fontSize: branding.fontSizeBase * 0.8,
                    color: dotColor,
                    fontWeight: 600,
                  }}
                >
                  {m.date}
                </span>
              )}
              <span
                style={{
                  fontFamily: branding.headingFont,
                  fontSize: branding.fontSizeLg,
                  color: branding.textColor,
                  fontWeight: 700,
                }}
              >
                {m.title}
              </span>
              {m.description && (
                <span
                  style={{
                    fontFamily: branding.bodyFont,
                    fontSize: branding.fontSizeBase,
                    color: branding.textColor,
                    opacity: 0.65,
                    maxWidth: 500,
                  }}
                >
                  {m.description}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

const HorizontalTimeline: React.FC<{
  milestones: TimelineData["milestones"];
  animationDelay: number;
  duration: number;
}> = ({ milestones, animationDelay, duration }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const dotSize = 16;
  const lineHeight = 3;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
      }}
    >
      {/* Line + dots row */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          width: "100%",
          position: "relative",
        }}
      >
        {milestones.map((m, i) => {
          const itemAnimFrames = durationFrames * 0.3;
          const itemStart = (i / Math.max(milestones.length - 1, 1)) * (durationFrames - itemAnimFrames);
          const progress = interpolate(
            frame - animationDelay,
            [itemStart, itemStart + itemAnimFrames],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
          );

          const lineProgress =
            i < milestones.length - 1
              ? interpolate(
                  frame - animationDelay,
                  [itemStart + itemAnimFrames * 0.3, itemStart + itemAnimFrames],
                  [0, 1],
                  { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
                )
              : 0;

          const dotColor = m.color ?? branding.primaryColor;
          const isLast = i === milestones.length - 1;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                position: "relative",
              }}
            >
              {/* Dot */}
              <div
                style={{
                  width: dotSize,
                  height: dotSize,
                  borderRadius: "50%",
                  backgroundColor: dotColor,
                  border: `3px solid ${branding.backgroundColor}`,
                  boxShadow: `0 0 0 2px ${dotColor}`,
                  zIndex: 2,
                  opacity: progress,
                  transform: `scale(${progress})`,
                  flexShrink: 0,
                }}
              />
              {/* Connecting line */}
              {!isLast && (
                <div
                  style={{
                    flex: 1,
                    height: lineHeight,
                    backgroundColor: branding.primaryColor,
                    opacity: 0.3,
                    transformOrigin: "left",
                    transform: `scaleX(${lineProgress})`,
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
      {/* Labels row */}
      <div
        style={{
          display: "flex",
          width: "100%",
          marginTop: 16,
        }}
      >
        {milestones.map((m, i) => {
          const itemAnimFrames = durationFrames * 0.3;
          const itemStart = (i / Math.max(milestones.length - 1, 1)) * (durationFrames - itemAnimFrames);
          const progress = interpolate(
            frame - animationDelay,
            [itemStart + itemAnimFrames * 0.3, itemStart + itemAnimFrames],
            [0, 1],
            { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
          );

          const dotColor = m.color ?? branding.primaryColor;

          return (
            <div
              key={i}
              style={{
                flex: 1,
                opacity: progress,
                transform: `translateY(${interpolate(progress, [0, 1], [8, 0])}px)`,
                display: "flex",
                flexDirection: "column",
                gap: 2,
              }}
            >
              {m.date && (
                <span
                  style={{
                    fontFamily: branding.bodyFont,
                    fontSize: branding.fontSizeBase * 0.75,
                    color: dotColor,
                    fontWeight: 600,
                  }}
                >
                  {m.date}
                </span>
              )}
              <span
                style={{
                  fontFamily: branding.headingFont,
                  fontSize: branding.fontSizeBase,
                  color: branding.textColor,
                  fontWeight: 700,
                }}
              >
                {m.title}
              </span>
              {m.description && (
                <span
                  style={{
                    fontFamily: branding.bodyFont,
                    fontSize: branding.fontSizeBase * 0.85,
                    color: branding.textColor,
                    opacity: 0.6,
                  }}
                >
                  {m.description}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
