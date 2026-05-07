import { loadFont as loadInter } from "@remotion/google-fonts/Inter";
import { loadFont as loadSpaceGrotesk } from "@remotion/google-fonts/SpaceGrotesk";
import { loadFont as loadRedHatDisplay } from "@remotion/google-fonts/RedHatDisplay";
import { loadFont as loadRedHatText } from "@remotion/google-fonts/RedHatText";
import type { Branding } from "./schema";

type FontLoader = () => { fontFamily: string };

const FONT_LOADERS: Record<string, FontLoader> = {
  Inter: () => loadInter("normal", { weights: ["400", "700"], subsets: ["latin"] }),
  "Space Grotesk": () =>
    loadSpaceGrotesk("normal", { weights: ["400", "700"], subsets: ["latin"] }),
  "Red Hat Display": () =>
    loadRedHatDisplay("normal", { weights: ["400", "700", "900"], subsets: ["latin"] }),
  "Red Hat Text": () =>
    loadRedHatText("normal", { weights: ["400", "500", "700"], subsets: ["latin"] }),
};

/**
 * Load Google Fonts for the given branding. Returns resolved font family strings.
 * Call at the top level of your composition component.
 */
export function loadBrandingFonts(branding: Branding): {
  headingFontFamily: string;
  bodyFontFamily: string;
} {
  const headingLoader = FONT_LOADERS[branding.headingFont];
  const bodyLoader = FONT_LOADERS[branding.bodyFont];

  const headingFontFamily = headingLoader
    ? headingLoader().fontFamily
    : branding.headingFont;
  const bodyFontFamily = bodyLoader
    ? bodyLoader().fontFamily
    : branding.bodyFont;

  return { headingFontFamily, bodyFontFamily };
}
