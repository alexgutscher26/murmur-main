import { NextRequest, NextResponse } from "next/server";
import { getStripeClient } from "@/lib/stripe";
import type Stripe from "stripe";

export async function POST(req: NextRequest) {
  const stripe = getStripeClient();
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

  if (!stripe) {
    return NextResponse.json(
      { error: "Stripe client is not configured on the server." },
      { status: 503 },
    );
  }

  if (!webhookSecret) {
    console.warn("⚠️ STRIPE_WEBHOOK_SECRET is not set. Webhook verification skipped in dev.");
    return NextResponse.json(
      { error: "STRIPE_WEBHOOK_SECRET is not configured." },
      { status: 500 },
    );
  }

  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return NextResponse.json({ error: "Missing stripe-signature header." }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    const rawBody = await req.text();
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Webhook signature verification failed";
    console.error("❌ Stripe webhook signature verification error:", message);
    return NextResponse.json({ error: `Webhook Error: ${message}` }, { status: 400 });
  }

  console.log(`🔔 Received Stripe Webhook Event: ${event.type} [${event.id}]`);

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session;
        const licenseKey = session.metadata?.licenseKey;
        const tier = session.metadata?.tier;
        const customerEmail =
          session.customer_details?.email ||
          session.customer_email ||
          session.metadata?.customerEmail;

        console.log("✅ Checkout Session Completed:", {
          sessionId: session.id,
          customerEmail,
          tier,
          licenseKey,
          amountTotal: session.amount_total,
          paymentStatus: session.payment_status,
        });

        // If recurring subscription, link licenseKey to subscription metadata if needed
        if (session.subscription && licenseKey && typeof session.subscription === "string") {
          try {
            await stripe.subscriptions.update(session.subscription, {
              metadata: {
                licenseKey,
                tier: tier || "pro_annual",
                customerEmail: customerEmail || "",
              },
            });
          } catch (updateErr) {
            console.warn("Could not attach metadata to subscription directly:", updateErr);
          }
        }
        break;
      }

      case "customer.subscription.updated": {
        const subscription = event.data.object as Stripe.Subscription;
        const licenseKey = subscription.metadata?.licenseKey;
        console.log("🔄 Subscription Updated:", {
          subscriptionId: subscription.id,
          status: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end,
          licenseKey,
        });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object as Stripe.Subscription;
        const licenseKey = subscription.metadata?.licenseKey;
        console.log("🛑 Subscription Canceled/Deleted:", {
          subscriptionId: subscription.id,
          licenseKey,
          endedAt: subscription.ended_at,
        });
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object as Stripe.Invoice;
        console.log("💰 Invoice Payment Succeeded:", {
          invoiceId: invoice.id,
          customerEmail: invoice.customer_email,
          amountPaid: invoice.amount_paid,
          subscription: invoice.subscription,
        });
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object as Stripe.Invoice;
        console.warn("⚠️ Invoice Payment Failed:", {
          invoiceId: invoice.id,
          customerEmail: invoice.customer_email,
          attemptCount: invoice.attempt_count,
        });
        break;
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge;
        console.log("💸 Charge Refunded:", {
          chargeId: charge.id,
          amountRefunded: charge.amount_refunded,
          receiptEmail: charge.receipt_email,
        });
        break;
      }

      default:
        // Unhandled event type
        break;
    }

    return NextResponse.json({ received: true, eventId: event.id });
  } catch (err: unknown) {
    console.error(`Error processing webhook event ${event.type}:`, err);
    return NextResponse.json(
      { error: "Webhook event processing encountered an error" },
      { status: 500 },
    );
  }
}
