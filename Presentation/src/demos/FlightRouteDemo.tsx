import React from "react";
import { z } from "zod";
import { AbsoluteFill } from "remotion";
import {
  brandingSelectionSchema,
  BrandingProvider,
  resolveBranding,
  loadBrandingFonts,
} from "../shared/branding";
import { FlightRoute, flightRouteDataSchema } from "../shared/components";

export const flightRouteDemoSchema = z.object({
  branding: brandingSelectionSchema,
  flight: flightRouteDataSchema,
});

export const FlightRouteDemo: React.FC<
  z.infer<typeof flightRouteDemoSchema>
> = ({ branding: brandingSelection, flight }) => {
  const branding = resolveBranding(brandingSelection);
  loadBrandingFonts(branding);

  return (
    <BrandingProvider selection={brandingSelection}>
      <AbsoluteFill>
        <FlightRoute {...flight} />
      </AbsoluteFill>
    </BrandingProvider>
  );
};
