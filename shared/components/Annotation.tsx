import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

const circleAnnotationSchema = z.object({
  type: z.literal("circle"),
  x: z.number().describe("Center X (0-100% of container)"),
  y: z.number().describe("Center Y (0-100% of container)"),
  width: z.number().default(15).describe("Width (% of container)"),
  height: z.number().default(8).describe("Height (% of container)"),
  color: zColor().optional(),
  strokeWidth: z.number().default(3),
  startTime: z.number().describe("When to appear (seconds)"),
  endTime: z.number().optional().describe("When to disappear (seconds, omit = stay)"),
});

const arrowAnnotationSchema = z.object({
  type: z.literal("arrow"),
  fromX: z.number().describe("Start X (0-100%)"),
  fromY: z.number().describe("Start Y (0-100%)"),
  toX: z.number().describe("End X (0-100%)"),
  toY: z.number().describe("End Y (0-100%)"),
  color: zColor().optional(),
  strokeWidth: z.number().default(3),
  startTime: z.number().describe("When to appear (seconds)"),
  endTime: z.number().optional().describe("When to disappear (seconds, omit = stay)"),
});

const noteAnnotationSchema = z.object({
  type: z.literal("note"),
  x: z.number().describe("X position (0-100%)"),
  y: z.number().describe("Y position (0-100%)"),
  text: z.string(),
  fontSize: z.number().default(20),
  color: zColor().optional(),
  bgColor: zColor().optional().describe("Background color for note"),
  startTime: z.number().describe("When to appear (seconds)"),
  endTime: z.number().optional().describe("When to disappear (seconds, omit = stay)"),
});

const zoomAnnotationSchema = z.object({
  type: z.literal("zoom"),
  x: z.number().describe("Zoom center X (0-100%)"),
  y: z.number().describe("Zoom center Y (0-100%)"),
  scale: z.number().default(2).describe("Zoom level"),
  startTime: z.number().describe("When zoom starts (seconds)"),
  endTime: z.number().describe("When zoom ends (seconds)"),
  transitionDuration: z.number().default(0.5).describe("Zoom in/out transition (seconds)"),
});

const annotationItemSchema = z.discriminatedUnion("type", [
  circleAnnotationSchema,
  arrowAnnotationSchema,
  noteAnnotationSchema,
  zoomAnnotationSchema,
]);

export const annotationDataSchema = z.object({
  annotations: z.array(annotationItemSchema),
});

export type AnnotationData = z.infer<typeof annotationDataSchema>;
type AnnotationItem = z.infer<typeof annotationItemSchema>;

// Compute visibility for items with startTime/endTime
function useItemVisibility(
  frame: number,
  fps: number,
  startTime: number,
  endTime: number | undefined,
): number {
  const fadeFrames = fps * 0.2;
  const startFrame = startTime * fps;
  const fadeIn = interpolate(frame, [startFrame, startFrame + fadeFrames], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  if (endTime === undefined) return fadeIn;

  const endFrame = endTime * fps;
  const fadeOut = interpolate(frame, [endFrame - fadeFrames, endFrame], [1, 0], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return Math.min(fadeIn, fadeOut);
}

const CircleAnnotation: React.FC<{
  item: z.infer<typeof circleAnnotationSchema>;
  frame: number;
  fps: number;
  defaultColor: string;
}> = ({ item, frame, fps, defaultColor }) => {
  const opacity = useItemVisibility(frame, fps, item.startTime, item.endTime);
  const color = item.color ?? defaultColor;

  return (
    <div
      style={{
        position: "absolute",
        left: `${item.x - item.width / 2}%`,
        top: `${item.y - item.height / 2}%`,
        width: `${item.width}%`,
        height: `${item.height}%`,
        border: `${item.strokeWidth}px solid ${color}`,
        borderRadius: "50%",
        opacity,
        pointerEvents: "none",
      }}
    />
  );
};

const ArrowAnnotation: React.FC<{
  item: z.infer<typeof arrowAnnotationSchema>;
  frame: number;
  fps: number;
  defaultColor: string;
}> = ({ item, frame, fps, defaultColor }) => {
  const opacity = useItemVisibility(frame, fps, item.startTime, item.endTime);
  const color = item.color ?? defaultColor;

  // Arrow as SVG overlay
  const headSize = 10;
  const dx = item.toX - item.fromX;
  const dy = item.toY - item.fromY;
  const angle = Math.atan2(dy, dx);

  return (
    <svg
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        pointerEvents: "none",
        opacity,
      }}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
    >
      <line
        x1={item.fromX}
        y1={item.fromY}
        x2={item.toX}
        y2={item.toY}
        stroke={color}
        strokeWidth={item.strokeWidth * 0.15}
        strokeLinecap="round"
      />
      {/* Arrowhead */}
      <polygon
        points={`
          ${item.toX},${item.toY}
          ${item.toX - headSize * 0.12 * Math.cos(angle - 0.4)},${item.toY - headSize * 0.12 * Math.sin(angle - 0.4)}
          ${item.toX - headSize * 0.12 * Math.cos(angle + 0.4)},${item.toY - headSize * 0.12 * Math.sin(angle + 0.4)}
        `}
        fill={color}
      />
    </svg>
  );
};

const NoteAnnotation: React.FC<{
  item: z.infer<typeof noteAnnotationSchema>;
  frame: number;
  fps: number;
  defaultColor: string;
  branding: { bodyFont: string };
}> = ({ item, frame, fps, defaultColor, branding }) => {
  const opacity = useItemVisibility(frame, fps, item.startTime, item.endTime);
  const color = item.color ?? defaultColor;
  const bg = item.bgColor ?? "rgba(0,0,0,0.8)";

  return (
    <div
      style={{
        position: "absolute",
        left: `${item.x}%`,
        top: `${item.y}%`,
        opacity,
        pointerEvents: "none",
        transform: `translateY(${interpolate(opacity, [0, 1], [8, 0])}px)`,
      }}
    >
      <div
        style={{
          backgroundColor: bg,
          color,
          padding: "8px 14px",
          borderRadius: 6,
          fontFamily: branding.bodyFont,
          fontSize: item.fontSize,
          fontWeight: 500,
          whiteSpace: "nowrap",
          boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
        }}
      >
        {item.text}
      </div>
    </div>
  );
};

export const Annotation: React.FC<
  AnnotationData & { children: React.ReactNode }
> = ({ annotations, children }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const defaultColor = "#ee0000";

  // Find active zoom
  const activeZoom = annotations.find(
    (a): a is z.infer<typeof zoomAnnotationSchema> => {
      if (a.type !== "zoom") return false;
      const t = frame / fps;
      return t >= a.startTime - a.transitionDuration && t <= a.endTime + a.transitionDuration;
    },
  );

  let scale = 1;
  let translateX = 0;
  let translateY = 0;

  if (activeZoom) {
    const t = frame / fps;
    const transFrames = activeZoom.transitionDuration * fps;
    const startFrame = activeZoom.startTime * fps;
    const endFrame = activeZoom.endTime * fps;

    // Zoom in
    const zoomIn = interpolate(
      frame,
      [startFrame - transFrames, startFrame],
      [0, 1],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
    );
    // Zoom out
    const zoomOut = interpolate(
      frame,
      [endFrame, endFrame + transFrames],
      [1, 0],
      { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.out(Easing.quad) },
    );
    const zoomProgress = Math.min(zoomIn, zoomOut);

    scale = interpolate(zoomProgress, [0, 1], [1, activeZoom.scale]);
    // Translate so the zoom center stays in view
    translateX = interpolate(zoomProgress, [0, 1], [0, -(activeZoom.x - 50) * (activeZoom.scale - 1) * 0.01 * 100]);
    translateY = interpolate(zoomProgress, [0, 1], [0, -(activeZoom.y - 50) * (activeZoom.scale - 1) * 0.01 * 100]);
  }

  return (
    <div style={{ width: "100%", height: "100%", flex: 1, position: "relative", overflow: "hidden" }}>
      <div
        style={{
          width: "100%",
          height: "100%",
          transform: `scale(${scale}) translate(${translateX}%, ${translateY}%)`,
          transformOrigin: "center center",
        }}
      >
        {children}
      </div>

      {/* Annotation overlays (on top, not affected by zoom) */}
      <div style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%" }}>
        {annotations
          .filter((a) => a.type !== "zoom")
          .map((item, i) => {
            switch (item.type) {
              case "circle":
                return <CircleAnnotation key={i} item={item} frame={frame} fps={fps} defaultColor={defaultColor} />;
              case "arrow":
                return <ArrowAnnotation key={i} item={item} frame={frame} fps={fps} defaultColor={defaultColor} />;
              case "note":
                return <NoteAnnotation key={i} item={item} frame={frame} fps={fps} defaultColor={defaultColor} branding={branding} />;
              default:
                return null;
            }
          })}
      </div>
    </div>
  );
};
