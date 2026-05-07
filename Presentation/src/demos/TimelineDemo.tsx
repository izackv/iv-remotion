import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { Timeline, timelineDataSchema } from "../shared/components";

export const timelineDemoSchema = z.object({
  branding: brandingSelectionSchema,
  timeline: timelineDataSchema,
  title: z.string().default("Project Roadmap"),
});

export const TimelineDemo: React.FC<z.infer<typeof timelineDemoSchema>> = ({
  branding: brandingSelection,
  timeline,
  title,
}) => {
  const branding = resolveBranding(brandingSelection);
  const { headingFontFamily } = loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill
        style={{
          backgroundColor: branding.backgroundColor,
          padding: branding.spacing * 3,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <h1
          style={{
            fontFamily: headingFontFamily,
            color: branding.textColor,
            fontSize: branding.fontSizeXl,
            fontWeight: 700,
            margin: 0,
            marginBottom: branding.spacing * 3,
          }}
        >
          {title}
        </h1>
        <div
          style={{
            width: timeline.variant === "horizontal" ? "85%" : "auto",
          }}
        >
          <Timeline {...timeline} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
