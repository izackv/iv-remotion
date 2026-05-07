import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { GeoHeatmap, geoHeatmapDataSchema } from "../shared/components";

export const geoHeatmapDemoSchema = z.object({
  branding: brandingSelectionSchema,
  heatmap: geoHeatmapDataSchema,
  title: z.string().default("Global Sales"),
});

export const GeoHeatmapDemo: React.FC<
  z.infer<typeof geoHeatmapDemoSchema>
> = ({ branding: brandingSelection, heatmap, title }) => {
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
            marginBottom: branding.spacing * 2,
          }}
        >
          {title}
        </h1>
        <div style={{ width: "90%", height: "75%" }}>
          <GeoHeatmap {...heatmap} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
