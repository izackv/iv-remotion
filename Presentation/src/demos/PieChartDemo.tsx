import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { PieChart, pieChartDataSchema } from "../shared/components";

export const pieChartDemoSchema = z.object({
  branding: brandingSelectionSchema,
  chart: pieChartDataSchema,
  title: z.string().default("Market Share"),
});

export const PieChartDemo: React.FC<z.infer<typeof pieChartDemoSchema>> = ({
  branding: brandingSelection,
  chart,
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
            marginBottom: branding.spacing * 2,
          }}
        >
          {title}
        </h1>
        <div style={{ width: "60%", height: "70%" }}>
          <PieChart {...chart} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
