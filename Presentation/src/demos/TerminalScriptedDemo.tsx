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
  TerminalScripted,
  terminalScriptedDataSchema,
  Annotation,
  annotationDataSchema,
} from "../shared/components";

export const terminalScriptedDemoSchema = z.object({
  branding: brandingSelectionSchema,
  terminal: terminalScriptedDataSchema,
  annotations: annotationDataSchema,
});

export const TerminalScriptedDemo: React.FC<
  z.infer<typeof terminalScriptedDemoSchema>
> = ({ branding: brandingSelection, terminal, annotations }) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill
        style={{
          backgroundColor: branding.backgroundColor,
          padding: 60,
        }}
      >
        <Annotation {...annotations}>
          <TerminalScripted {...terminal} />
        </Annotation>
      </AbsoluteFill>
    </BrandingProvider>
  );
};
