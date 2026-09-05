import { NextRequest, NextResponse } from "next/server";
import { calculatePrice, getStripeClient, PlanTierKey } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tier, discountCode, customerEmail } = body as {
      tier: PlanTierKey;
      discountCode?: string | null;
      customerEmail?: string | null;
    };

    if (tier !== "pro_lifetime" && tier !== "pro_annual") {
      return NextResponse.json(
        { error: "Invalid tier specified. Expected 'pro_lifetime' or 'pro_annual'." },
        { status: 400 }
      );
    }

    const pricing = calculatePrice(tier, discountCode);
    const origin = req.nextUrl.origin || "http://localhost:3000";

    const stripe = getStripeClient();

    if (!stripe) {
      // Graceful fallback for local development or demo without active Stripe credentials
      const mockSessionId = `mock_sess_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
      const successUrl = new URL("/pricing/success", origin);
      successUrl.searchParams.set("session_id", mockSessionId);
      successUrl.searchParams.set("plan", tier);
      if (discountCode) successUrl.searchParams.set("code", discountCode);

      return NextResponse.json({
        url: successUrl.toString(),
        mode: "mock",
        pricing,
      });
    }

    const successUrl = `${origin}/pricing/success?session_id={CHECKOUT_SESSION_ID}&plan=${tier}${
      discountCode ? `&code=${encodeURIComponent(discountCode)}` : ""
    }`;
    const cancelUrl = `${origin}/pricing`;

    const isSubscription = tier === "pro_annual";

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: [
        {
          price_data: {
            currency: pricing.currency,
            product_data: {
              name: pricing.name,
              description: pricing.discountApplied
                ? `Includes special discount: ${pricing.discountApplied}`
                : "Murmur 100% on-device voice-to-text with Whisper Large v3 Turbo.",
            },
            unit_amount: pricing.amountCents,
            ...(isSubscription
              ? {
                  recurring: {
                    interval: "year",
                  },
                }
              : {}),
          },
          quantity: 1,
        },
      ],
      mode: isSubscription ? "subscription" : "payment",
      customer_email: customerEmail || undefined,
      success_url: successUrl,
      cancel_url: cancelUrl,
      metadata: {
        tier,
        discountCode: discountCode || "NONE",
      },
    });

    return NextResponse.json({ url: session.url, sessionId: session.id });
  } catch (err: unknown) {
    console.error("Stripe checkout error:", err);
    const message = err instanceof Error ? err.message : "Failed to create checkout session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
