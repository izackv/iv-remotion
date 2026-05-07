import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { Table, tableDataSchema } from "../shared/components";

export const tableDemoSchema = z.object({
  branding: brandingSelectionSchema,
  table: tableDataSchema,
  title: z.string().default("Quarterly Results"),
});

export const TableDemo: React.FC<z.infer<typeof tableDemoSchema>> = ({
  branding: brandingSelection,
  table,
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
            marginBottom: branding.spacing * 3,
          }}
        >
          {title}
        </h1>
        <div style={{ width: "75%" }}>
          <Table {...table} />
        </div>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
