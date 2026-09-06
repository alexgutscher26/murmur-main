import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { customerEmail, licenseKey } = body as {
      customerEmail?: string;
      licenseKey?: string;
    };

    const stripe = getStripeClient();
    const origin = req.nextUrl.origin || "http://localhost:3000";
    const returnUrl = `${origin}/pricing`;

    if (!stripe) {
      // Mock portal response when Stripe credentials are not present in dev
      return NextResponse.json({
        url: `${origin}/pricing?portal_mock=true`,
        message: "Stripe development mode: Simulated customer portal redirect.",
      });
    }

    let customerId: string | null = null;

    // 1. Try finding customer by license key in subscription metadata
    if (licenseKey) {
      try {
        const search = await stripe.subscriptions.search({
          query: `metadata['licenseKey']:'${licenseKey.trim().toUpperCase()}'`,
          limit: 1,
        });
        if (search.data.length > 0 && typeof search.data[0].customer === "string") {
          customerId = search.data[0].customer;
        }
      } catch {}
    }

    // 2. Try finding customer by email
    if (!customerId && customerEmail) {
      try {
        const customers = await stripe.customers.list({
          email: customerEmail.trim().toLowerCase(),
          limit: 1,
        });
        if (customers.data.length > 0) {
          customerId = customers.data[0].id;
        }
      } catch {}
    }

    if (!customerId) {
      return NextResponse.json(
        {
          error: "No active Stripe customer found for this license key or email. If you hold a Lifetime license, no recurring billing exists to manage.",
        },
        { status: 404 }
      );
    }

    const portalSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: returnUrl,
    });

    return NextResponse.json({ url: portalSession.url });
  } catch (err: unknown) {
    console.error("Billing portal error:", err);
    const message = err instanceof Error ? err.message : "Failed to generate billing portal session";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
