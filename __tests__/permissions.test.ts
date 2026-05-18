import { canDo, planRequiredFor } from "@/lib/permissions";

describe("canDo", () => {
  it("allows ADMIN on a PRO plan to manage users", () => {
    expect(canDo("ADMIN", "MANAGE_USERS", "PRO")).toBe(true);
  });

  it("blocks VIEWER from writing data even on ENTERPRISE", () => {
    expect(canDo("VIEWER", "WRITE_DATA", "ENTERPRISE")).toBe(false);
  });

  it("blocks MANAGER on FREE plan from using AI (plan-gated)", () => {
    expect(canDo("MANAGER", "USE_AI", "FREE")).toBe(false);
  });

  it("allows MANAGER on PRO to use AI", () => {
    expect(canDo("MANAGER", "USE_AI", "PRO")).toBe(true);
  });

  it("returns false when role is undefined", () => {
    expect(canDo(undefined, "READ_DATA", "PRO")).toBe(false);
  });
});

describe("planRequiredFor", () => {
  it("returns FREE for permissions any plan can use", () => {
    expect(planRequiredFor("READ_DATA")).toBe("FREE");
  });

  it("returns PRO for AI features", () => {
    expect(planRequiredFor("USE_AI")).toBe("PRO");
  });

  it("returns PRO for export", () => {
    expect(planRequiredFor("EXPORT_DATA")).toBe("PRO");
  });
});
