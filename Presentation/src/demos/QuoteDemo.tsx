import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { Quote, quoteDataSchema } from "../shared/components";

export const quoteDemoSchema = z.object({
  branding: brandingSelectionSchema,
  quote: quoteDataSchema,
});

export const QuoteDemo: React.FC<z.infer<typeof quoteDemoSchema>> = ({
  branding: brandingSelection,
  quote,
}) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill
        style={{
          backgroundColor: branding.backgroundColor,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: branding.spacing * 5,
        }}
      >
        <Quote {...quote} />
      </AbsoluteFill>
    </BrandingProvider>
  );
};
