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
  TerminalReplay,
  terminalReplayDataSchema,
  Annotation,
  annotationDataSchema,
} from "../shared/components";

// Cast file is loaded from public/sample.cast via staticFile()
// To use your own recording: asciinema rec public/my-session.cast

export const terminalReplayDemoSchema = z.object({
  branding: brandingSelectionSchema,
  terminal: terminalReplayDataSchema,
  annotations: annotationDataSchema,
});

export const TerminalReplayDemo: React.FC<
  z.infer<typeof terminalReplayDemoSchema>
> = ({ branding: brandingSelection, terminal, annotations }) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill
        style={{
          backgroundColor: branding.backgroundColor,
          padding: 60,
          display: "flex",
        }}
      >
        <Annotation {...annotations}>
          <TerminalReplay {...terminal} />
        </Annotation>
      </AbsoluteFill>
    </BrandingProvider>
  );
};

export const SAMPLE_CAST_FILE = "sample.cast";
