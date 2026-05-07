import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { BulletList, bulletListDataSchema } from "../shared/components";

export const bulletListDemoSchema = z.object({
  branding: brandingSelectionSchema,
  list: bulletListDataSchema,
  title: z.string().default("Key Takeaways"),
});

export const BulletListDemo: React.FC<
  z.infer<typeof bulletListDemoSchema>
> = ({ branding: brandingSelection, list, title }) => {
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
        <div style={{ width: "60%" }}>
          <BulletList {...list} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
