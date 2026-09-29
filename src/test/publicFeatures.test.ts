import { describe, expect, it } from "vitest";
import { FEATURES, PRO_IA_FEATURE_TITLES, PUBLIC_FEATURES } from "@/data/features";

describe("public feature catalog", () => {
  it("hides every Pro + IA-only feature from public pages", () => {
    const visibleTitles = PUBLIC_FEATURES.map((feature) => feature.title);

    expect([...PRO_IA_FEATURE_TITLES].every((title) => !visibleTitles.includes(title))).toBe(true);
  });

  it("retains the complete source catalog for future reactivation", () => {
    expect(FEATURES.length).toBe(PUBLIC_FEATURES.length + PRO_IA_FEATURE_TITLES.size);
  });
});
