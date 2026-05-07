import React, { createContext, useContext, useMemo } from "react";
import type { Branding, BrandingSelection } from "./schema";
import { resolveBranding } from "./schema";

const BrandingContext = createContext<Branding | null>(null);

export const BrandingProvider: React.FC<{
  selection: BrandingSelection;
  children: React.ReactNode;
}> = ({ selection, children }) => {
  const branding = useMemo(() => resolveBranding(selection), [selection]);
  return (
    <BrandingContext.Provider value={branding}>
      {children}
    </BrandingContext.Provider>
  );
};

export function useBranding(): Branding {
  const ctx = useContext(BrandingContext);
  if (!ctx) throw new Error("useBranding must be used inside BrandingProvider");
  return ctx;
}
