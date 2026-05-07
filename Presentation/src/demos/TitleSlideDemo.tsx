import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { TitleSlide, titleSlideDataSchema } from "../shared/components";

export const titleSlideDemoSchema = z.object({
  branding: brandingSelectionSchema,
  slide: titleSlideDataSchema,
});

export const TitleSlideDemo: React.FC<
  z.infer<typeof titleSlideDemoSchema>
> = ({ branding: brandingSelection, slide }) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill>
        <TitleSlide {...slide} />
      </AbsoluteFill>
    </BrandingProvider>
  );
};
