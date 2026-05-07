import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { ProgressBar, progressBarDataSchema } from "../shared/components";

export const progressBarDemoSchema = z.object({
  branding: brandingSelectionSchema,
  bars: z.array(progressBarDataSchema).describe("Progress bars to display"),
  title: z.string().default("Project Progress"),
});

export const ProgressBarDemo: React.FC<
  z.infer<typeof progressBarDemoSchema>
> = ({ branding: brandingSelection, bars, title }) => {
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
            width: "70%",
            display: "flex",
            flexDirection: "column",
            gap: branding.spacing * 2,
            alignItems: "center",
          }}
        >
          {bars.map((bar, i) => (
            <div
              key={i}
              style={{
                width: bar.variant === "circular" ? "auto" : "100%",
              }}
            >
              <ProgressBar {...bar} animationDelay={i * 10} />
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
