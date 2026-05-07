import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { TwoColumnCompare, twoColumnCompareDataSchema } from "../shared/components";

export const twoColumnCompareDemoSchema = z.object({
  branding: brandingSelectionSchema,
  compare: twoColumnCompareDataSchema,
  title: z.string().default(""),
});

export const TwoColumnCompareDemo: React.FC<
  z.infer<typeof twoColumnCompareDemoSchema>
> = ({ branding: brandingSelection, compare, title }) => {
  const branding = resolveBranding(brandingSelection);
  const { headingFontFamily } = loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill
        style={{
          backgroundColor: branding.backgroundColor,
          padding: branding.spacing * 4,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {title && (
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
        )}
        <div style={{ width: "80%" }}>
          <TwoColumnCompare {...compare} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
