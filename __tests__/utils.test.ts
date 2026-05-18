import {
  formatCurrency,
  formatCurrencyCompact,
  formatPercent,
  getInitials,
  cn,
} from "@/lib/utils";

describe("lib/utils", () => {
  describe("formatCurrency", () => {
    it("formats USD with no fractional digits", () => {
      expect(formatCurrency(24800)).toBe("$24,800");
    });

    it("rounds the input", () => {
      expect(formatCurrency(99.6)).toBe("$100");
    });
  });

  describe("formatCurrencyCompact", () => {
    it("uses compact notation for large numbers", () => {
      expect(formatCurrencyCompact(24800)).toMatch(/\$24\.8K/);
    });
  });

  describe("formatPercent", () => {
    it("prefixes positive numbers with +", () => {
      expect(formatPercent(12.3)).toBe("+12.3%");
    });

    it("preserves the negative sign without a prefix", () => {
      expect(formatPercent(-4.5)).toBe("-4.5%");
    });
  });

  describe("getInitials", () => {
    it("returns the first letter of the first two words, uppercased", () => {
      expect(getInitials("John Doe")).toBe("JD");
    });

    it("returns ? for null/undefined/empty input", () => {
      expect(getInitials(null)).toBe("?");
      expect(getInitials(undefined)).toBe("?");
      expect(getInitials("")).toBe("?");
    });
  });

  describe("cn", () => {
    it("merges conditional classes and lets later tailwind classes win", () => {
      expect(cn("p-2", false && "hidden", "p-4")).toBe("p-4");
    });
  });
});
