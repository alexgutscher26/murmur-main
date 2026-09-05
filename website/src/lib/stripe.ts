import Stripe from "stripe";

export type PlanTierKey = "pro_lifetime" | "pro_annual";
export type DiscountCode = "SWITCHER-40" | "STUDENT-50" | "OSS-50";

export interface PricingDetails {
  tier: PlanTierKey;
  name: string;
  amountCents: number;
  currency: string;
  interval?: "year";
  discountApplied?: string;
  originalAmountCents: number;
}

export function getStripeClient(): Stripe | null {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey) return null;

  return new Stripe(secretKey, {
    apiVersion: "2025-02-24.acacia" as unknown as Stripe.LatestApiVersion,
    typescript: true,
  });
}

export function calculatePrice(tier: PlanTierKey, discountCode?: string | null): PricingDetails {
  const normalizedDiscount = discountCode?.trim().toUpperCase();

  if (tier === "pro_lifetime") {
    const originalAmountCents = 8900; // $89.00

    if (normalizedDiscount === "SWITCHER-40") {
      return {
        tier,
        name: "Murmur Pro Lifetime (Switcher Guarantee)",
        amountCents: 6900, // $69.00 ($20 off)
        currency: "usd",
        discountApplied: "Switcher Guarantee ($20 Off Lifetime)",
        originalAmountCents,
      };
    }

    if (normalizedDiscount === "STUDENT-50" || normalizedDiscount === "OSS-50") {
      return {
        tier,
        name: normalizedDiscount === "STUDENT-50"
          ? "Murmur Pro Lifetime (Student & Academic Grant)"
          : "Murmur Pro Lifetime (Open Source Maintainer Grant)",
        amountCents: 4400, // $44.00 (50% off)
        currency: "usd",
        discountApplied: "Academic / OSS 50% Grant",
        originalAmountCents,
      };
    }

    return {
      tier,
      name: "Murmur Pro Lifetime License",
      amountCents: 8900,
      currency: "usd",
      originalAmountCents,
    };
  }

  // tier === "pro_annual"
  const originalAmountCents = 4900; // $49.00 / yr

  if (normalizedDiscount === "SWITCHER-40") {
    return {
      tier,
      name: "Murmur Pro Annual Pass (Switcher Deal)",
      amountCents: 2900, // $29.00 / first yr (40% off)
      currency: "usd",
      interval: "year",
      discountApplied: "Switcher Deal (40% Off First Year)",
      originalAmountCents,
    };
  }

  if (normalizedDiscount === "STUDENT-50" || normalizedDiscount === "OSS-50") {
    return {
      tier,
      name: normalizedDiscount === "STUDENT-50"
        ? "Murmur Pro Annual Pass (Student Grant)"
        : "Murmur Pro Annual Pass (Open Source Grant)",
      amountCents: 2400, // $24.00 / yr (50% off)
      currency: "usd",
      interval: "year",
      discountApplied: "Academic / OSS 50% Annual Grant",
      originalAmountCents,
    };
  }

  return {
    tier,
    name: "Murmur Pro Annual Pass",
    amountCents: 4900,
    currency: "usd",
    interval: "year",
    originalAmountCents,
  };
}

/**
 * Generates an authentic, cryptographically-spaced Murmur license key.
 * Formats match desktop app activation rules in `src/lib/plan.ts`.
 */
export function generateLicenseKey(tier: PlanTierKey, discountCode?: string | null): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // Base32 unambiguous
  const chunk = (len: number) => {
    let res = "";
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  const discount = discountCode?.trim().toUpperCase();

  let prefix = "PRO";
  if (discount === "SWITCHER-40") {
    prefix = "SWITCHER";
  } else if (discount === "STUDENT-50") {
    prefix = "STUDENT";
  } else if (discount === "OSS-50") {
    prefix = "OSS";
  } else if (tier === "pro_lifetime") {
    prefix = "LIFETIME";
  }

  return `${prefix}-${chunk(4)}-${chunk(4)}-${chunk(4)}`;
}
