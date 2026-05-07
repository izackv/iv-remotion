import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { BarChart, barChartDataSchema } from "../shared/components";

export const barChartDemoSchema = z.object({
  branding: brandingSelectionSchema,
  chart: barChartDataSchema,
  title: z.string().default("Revenue by Quarter"),
});

export const BarChartDemo: React.FC<z.infer<typeof barChartDemoSchema>> = ({
  branding: brandingSelection,
  chart,
  title,
}) => {
  const branding = resolveBranding(brandingSelection);
  const { headingFontFamily, bodyFontFamily } = loadBrandingFonts(branding);

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
        <div style={{ width: "80%", height: "70%" }}>
          <BarChart {...chart} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
