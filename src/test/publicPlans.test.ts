import { describe, expect, it } from "vitest";
import { getInitialPlanId, VISIBLE_PLAN_IDS, PLANS } from "@/lib/publicPlans";

describe("public plan offer", () => {
  it("shows only Plano Pro for R$ 30", () => {
    expect(VISIBLE_PLAN_IDS).toEqual(["profissional"]);
    expect(PLANS.profissional.name).toBe("Plano Pro");
    expect(PLANS.profissional.price).toBe("30");
    expect(PLANS.profissional.priceCents).toBe(3000);
  });

  it("keeps pro_ia configured but rejects it as a public selection", () => {
    expect(PLANS.pro_ia.id).toBe("pro_ia");
    expect(getInitialPlanId("pro_ia")).toBe("profissional");
    expect(getInitialPlanId("profissional")).toBe("profissional");
  });
});
