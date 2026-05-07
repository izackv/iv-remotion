import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { Counter, counterDataSchema } from "../shared/components";

export const counterDemoSchema = z.object({
  branding: brandingSelectionSchema,
  counters: z.array(counterDataSchema).describe("Counters to display"),
  title: z.string().default("Key Metrics"),
});

export const CounterDemo: React.FC<z.infer<typeof counterDemoSchema>> = ({
  branding: brandingSelection,
  counters,
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
        <div
          style={{
            display: "flex",
            gap: branding.spacing * 6,
            alignItems: "flex-start",
          }}
        >
          {counters.map((counter, i) => (
            <Counter key={i} {...counter} animationDelay={i * 8} />
          ))}
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
