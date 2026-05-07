import { z } from "zod";
import { zColor } from "@remotion/zod-types";
import { PRESETS } from "./presets";

export const brandingSchema = z.object({
  primaryColor: zColor().describe("Primary brand color"),
  secondaryColor: zColor().describe("Secondary brand color"),
  accentColor: zColor().describe("Accent / highlight color"),
  backgroundColor: zColor().describe("Background color"),
  textColor: zColor().describe("Main text color"),
  headingFont: z.string().describe("Font family for headings"),
  bodyFont: z.string().describe("Font family for body text"),
  fontSizeBase: z.number().describe("Base font size in px"),
  fontSizeLg: z.number().describe("Large font size in px"),
  fontSizeXl: z.number().describe("Extra-large font size in px"),
  borderRadius: z.number().describe("Border radius in px"),
  spacing: z.number().describe("Base spacing unit in px"),
});

export type Branding = z.infer<typeof brandingSchema>;

export const presetNames = Object.keys(PRESETS) as [string, ...string[]];

export const brandingSelectionSchema = z.object({
  preset: z.enum(presetNames).describe("Base branding preset"),
  overrides: brandingSchema.partial().optional().describe("Override individual branding values"),
});

export type BrandingSelection = z.infer<typeof brandingSelectionSchema>;

export function resolveBranding(selection: BrandingSelection): Branding {
  const base = PRESETS[selection.preset as keyof typeof PRESETS];
  if (!selection.overrides) return base;
  return { ...base, ...selection.overrides };
}
