import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import {
  SlideFrame,
  slideFrameDataSchema,
  BarChart,
  barChartDataSchema,
  PieChart,
  pieChartDataSchema,
} from "../shared/components";

export const slideFrameBarDemoSchema = z.object({
  branding: brandingSelectionSchema,
  frame: slideFrameDataSchema,
  chart: barChartDataSchema,
});

export const SlideFrameBarDemo: React.FC<
  z.infer<typeof slideFrameBarDemoSchema>
> = ({ branding: brandingSelection, frame: frameData, chart }) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill>
        <SlideFrame {...frameData}>
          <div style={{ width: "90%", height: "90%" }}>
            <BarChart {...chart} />
          </div>
        </SlideFrame>
      </AbsoluteFill>
    </BrandingProvider>
  );
};

export const slideFramePieDemoSchema = z.object({
  branding: brandingSelectionSchema,
  frame: slideFrameDataSchema,
  chart: pieChartDataSchema,
});

export const SlideFramePieDemo: React.FC<
  z.infer<typeof slideFramePieDemoSchema>
> = ({ branding: brandingSelection, frame: frameData, chart }) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill>
        <SlideFrame {...frameData}>
          <div style={{ width: "65%", height: "90%" }}>
            <PieChart {...chart} />
          </div>
        </SlideFrame>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
