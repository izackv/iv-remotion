import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { IconGrid, iconGridDataSchema } from "../shared/components";

export const iconGridDemoSchema = z.object({
  branding: brandingSelectionSchema,
  grid: iconGridDataSchema,
  title: z.string().default("Platform Features"),
});

export const IconGridDemo: React.FC<z.infer<typeof iconGridDemoSchema>> = ({
  branding: brandingSelection,
  grid,
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
            marginBottom: branding.spacing * 4,
          }}
        >
          {title}
        </h1>
        <div style={{ width: "75%" }}>
          <IconGrid {...grid} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
