import React from "react";
import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { useCurrentFrame, useVideoConfig, interpolate, Easing } from "remotion";
import { useBranding } from "../branding";

const phaseSchema = z.object({
  label: z.string().describe("Phase label"),
  value: z.number().min(0).max(100).describe("Percentage this phase occupies"),
  color: zColor().optional().describe("Color for this phase segment"),
});

export const progressBarDataSchema = z.object({
  value: z.number().min(0).max(100).describe("Progress percentage (0-100, used when no phases)"),
  label: z.string().default("").describe("Label text"),
  showPercentage: z.boolean().default(true),
  variant: z.enum(["horizontal", "circular"]).default("horizontal"),
  color: zColor().optional().describe("Override fill color"),
  trackColor: zColor().optional().describe("Override track color"),
  thickness: z.number().default(20).describe("Bar height or ring stroke width"),
  size: z.number().default(200).describe("Circular variant diameter"),
  phases: z.array(phaseSchema).optional().describe("Phases for circular variant (linear sequence)"),
  animationDelay: z
    .number()
    .default(0)
    .describe("Delay before animation starts (frames)"),
  duration: z.number().default(2).describe("Animation duration in seconds"),
});

export type ProgressBarData = z.infer<typeof progressBarDataSchema>;

export const ProgressBar: React.FC<ProgressBarData> = ({
  value,
  label = "",
  showPercentage = true,
  variant = "horizontal",
  color,
  trackColor,
  thickness = 20,
  size = 200,
  phases,
  animationDelay = 0,
  duration = 2,
}) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const branding = useBranding();
  const durationFrames = duration * fps;

  const fillColor = color ?? branding.primaryColor;
  const bgColor = trackColor ?? (branding.backgroundColor === "#ffffff"
    ? "#e5e7eb"
    : `${branding.textColor}22`);

  const progress = interpolate(
    frame - animationDelay,
    [0, durationFrames],
    [0, 1],
    { extrapolateLeft: "clamp", extrapolateRight: "clamp" },
  );

  if (variant === "circular" && phases && phases.length > 0) {
    return (
      <CircularPhases
        phases={phases}
        progress={progress}
        size={size}
        thickness={thickness}
        bgColor={bgColor}
        defaultColor={fillColor}
        label={label}
        showPercentage={showPercentage}
        branding={branding}
      />
    );
  }

  const animatedValue = progress * value;

  if (variant === "circular") {
    return (
      <CircularProgress
        value={animatedValue}
        size={size}
        thickness={thickness}
        fillColor={fillColor}
        bgColor={bgColor}
        label={label}
        showPercentage={showPercentage}
        branding={branding}
      />
    );
  }

  return (
    <HorizontalProgress
      value={animatedValue}
      thickness={thickness}
      fillColor={fillColor}
      bgColor={bgColor}
      label={label}
      showPercentage={showPercentage}
      branding={branding}
    />
  );
};

const HorizontalProgress: React.FC<{
  value: number;
  thickness: number;
  fillColor: string;
  bgColor: string;
  label: string;
  showPercentage: boolean;
  branding: { textColor: string; bodyFont: string; borderRadius: number };
}> = ({ value, thickness, fillColor, bgColor, label, showPercentage, branding }) => {
  const barRadius = branding.borderRadius || thickness / 2;

  return (
    <div
      style={{
        width: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 8,
      }}
    >
      {(label || showPercentage) && (
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontFamily: branding.bodyFont,
            color: branding.textColor,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          <span>{label}</span>
          {showPercentage && <span>{Math.round(value)}%</span>}
        </div>
      )}
      <div
        style={{
          width: "100%",
          height: thickness,
          backgroundColor: bgColor,
          borderRadius: barRadius,
          overflow: "hidden",
        }}
      >
        <div
          style={{
            width: `${value}%`,
            height: "100%",
            backgroundColor: fillColor,
            borderRadius: barRadius,
          }}
        />
      </div>
    </div>
  );
};

const PHASE_COLORS = ["#ee0000", "#0066cc", "#3e8635", "#f0ab00", "#8b5cf6", "#ec4899"];

const CircularPhases: React.FC<{
  phases: { label: string; value: number; color?: string }[];
  progress: number;
  size: number;
  thickness: number;
  bgColor: string;
  defaultColor: string;
  label: string;
  showPercentage: boolean;
  branding: { textColor: string; bodyFont: string };
}> = ({ phases, progress, size, thickness, bgColor, defaultColor, label, showPercentage, branding }) => {
  const labelMargin = 60;
  const svgSize = size + labelMargin * 2;
  const center = svgSize / 2;
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;

  const total = phases.reduce((sum, p) => sum + p.value, 0);
  const animatedTotal = progress * total;

  let cumulative = 0;
  const arcs = phases.map((phase, i) => {
    const phaseStart = cumulative;
    cumulative += phase.value;
    const phaseEnd = cumulative;

    const filledInPhase = Math.max(0, Math.min(phase.value, animatedTotal - phaseStart));
    const filledLength = (filledInPhase / 100) * circumference;
    const startAngle = (phaseStart / 100) * 360;
    const midAngle = startAngle + (phase.value / 100) * 360 / 2;
    const color = phase.color ?? PHASE_COLORS[i % PHASE_COLORS.length];
    const labelOpacity = animatedTotal >= phaseStart ? 1 : 0;

    return { phase, filledLength, startAngle, midAngle, color, phaseStart, phaseEnd, labelOpacity };
  });

  const activePhaseIndex = arcs.findIndex(
    (a) => animatedTotal >= a.phaseStart && animatedTotal <= a.phaseEnd,
  );
  const activePhase = activePhaseIndex >= 0 ? phases[activePhaseIndex] : phases[phases.length - 1];

  const labelRadius = radius + thickness / 2 + 20;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <svg width={svgSize} height={svgSize} viewBox={`0 0 ${svgSize} ${svgSize}`}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={thickness}
        />
        {/* Phase arcs */}
        {arcs.map((arc, i) => (
          <circle
            key={`arc-${i}`}
            cx={center}
            cy={center}
            r={radius}
            fill="none"
            stroke={arc.color}
            strokeWidth={thickness}
            strokeDasharray={`${arc.filledLength} ${circumference - arc.filledLength}`}
            strokeDashoffset={0}
            transform={`rotate(${arc.startAngle - 90} ${center} ${center})`}
          />
        ))}
        {/* Phase labels outside the circle */}
        {arcs.map((arc, i) => {
          const angleRad = ((arc.midAngle - 90) * Math.PI) / 180;
          const lx = center + labelRadius * Math.cos(angleRad);
          const ly = center + labelRadius * Math.sin(angleRad);
          const isRight = Math.cos(angleRad) >= 0;

          return (
            <g key={`label-${i}`} opacity={arc.labelOpacity}>
              {/* Small dot connector */}
              <circle cx={lx} cy={ly} r={3} fill={arc.color} />
              <text
                x={lx + (isRight ? 8 : -8)}
                y={ly}
                textAnchor={isRight ? "start" : "end"}
                dominantBaseline="central"
                fill={branding.textColor}
                fontFamily={branding.bodyFont}
                fontSize={size * 0.05}
                fontWeight={500}
              >
                {arc.phase.label}
              </text>
            </g>
          );
        })}
        {/* Center text */}
        {showPercentage && (
          <text
            x={center}
            y={center - size * 0.06}
            textAnchor="middle"
            dominantBaseline="central"
            fill={branding.textColor}
            fontFamily={branding.bodyFont}
            fontSize={size * 0.16}
            fontWeight={700}
          >
            {Math.round(animatedTotal)}%
          </text>
        )}
        <text
          x={center}
          y={center + size * 0.08}
          textAnchor="middle"
          dominantBaseline="central"
          fill={branding.textColor}
          fontFamily={branding.bodyFont}
          fontSize={size * 0.07}
          opacity={0.7}
        >
          {activePhase.label}
        </text>
      </svg>
      {label && (
        <span
          style={{
            fontFamily: branding.bodyFont,
            color: branding.textColor,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};

const CircularProgress: React.FC<{
  value: number;
  size: number;
  thickness: number;
  fillColor: string;
  bgColor: string;
  label: string;
  showPercentage: boolean;
  branding: { textColor: string; bodyFont: string };
}> = ({ value, size, thickness, fillColor, bgColor, label, showPercentage, branding }) => {
  const radius = (size - thickness) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const center = size / 2;

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: 12,
      }}
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={thickness}
        />
        {/* Fill */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={fillColor}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${center} ${center})`}
        />
        {/* Center text */}
        {showPercentage && (
          <text
            x={center}
            y={center}
            textAnchor="middle"
            dominantBaseline="central"
            fill={branding.textColor}
            fontFamily={branding.bodyFont}
            fontSize={size * 0.18}
            fontWeight={700}
          >
            {Math.round(value)}%
          </text>
        )}
      </svg>
      {label && (
        <span
          style={{
            fontFamily: branding.bodyFont,
            color: branding.textColor,
            fontSize: 16,
            fontWeight: 500,
          }}
        >
          {label}
        </span>
      )}
    </div>
  );
};
