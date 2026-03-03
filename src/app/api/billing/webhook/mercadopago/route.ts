import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSubscriptionStatus, getPaymentDetails, mapMpStatusToSubscriptionStatus } from "@/lib/mercadopago";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Log the webhook event
    const webhookEvent = await prisma.webhookEvent.create({
      data: {
        provider: "mercadopago",
        eventType: body.type || body.action || "unknown",
        externalId: body.data?.id || body.id || `unknown_${Date.now()}`,
        payloadJson: body,
        status: "pending",
      },
    });

    try {
      // Handle different event types
      const eventType = body.type || body.action;

      if (eventType === "subscription_preapproval" || eventType === "preapproval") {
        await handlePreapprovalEvent(body);
      } else if (eventType === "payment") {
        await handlePaymentEvent(body);
      } else if (eventType === "subscription_authorized_payment") {
        await handleAuthorizedPaymentEvent(body);
      }

      // Mark webhook as processed
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: { status: "processed", processedAt: new Date() },
      });
    } catch (processingError) {
      // Mark webhook as failed but still return 200 to avoid retries
      await prisma.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          status: "failed",
          errorMessage: processingError instanceof Error ? processingError.message : "Unknown error",
        },
      });
    }

    // Always return 200 to acknowledge receipt
    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json({ received: true });
  }
}

async function handlePreapprovalEvent(body: { data?: { id?: string } }) {
  const preapprovalId = body.data?.id;
  if (!preapprovalId) return;

  // Get subscription details from MP
  const mpSubscription = await getSubscriptionStatus(preapprovalId);

  if (!mpSubscription) return;

  // Find subscription by preapproval ID
  const subscription = await prisma.subscription.findFirst({
    where: { mpPreapprovalId: preapprovalId },
  });

  if (!subscription) {
    // Try to find by external reference
    const externalRef = mpSubscription.external_reference;
    if (externalRef?.startsWith("user_")) {
      const userId = externalRef.replace("user_", "");
      await prisma.subscription.upsert({
        where: { userId },
        create: {
          userId,
          mpPreapprovalId: preapprovalId,
          status: mapMpStatusToSubscriptionStatus(mpSubscription.status || "pending"),
          externalReference: externalRef,
          startedAt: mpSubscription.date_created ? new Date(mpSubscription.date_created) : null,
          nextPaymentDate: mpSubscription.next_payment_date
            ? new Date(mpSubscription.next_payment_date)
            : null,
        },
        update: {
          status: mapMpStatusToSubscriptionStatus(mpSubscription.status || "pending"),
          startedAt: mpSubscription.date_created ? new Date(mpSubscription.date_created) : null,
          nextPaymentDate: mpSubscription.next_payment_date
            ? new Date(mpSubscription.next_payment_date)
            : null,
        },
      });
    }
    return;
  }

  // Update subscription status
  await prisma.subscription.update({
    where: { id: subscription.id },
    data: {
      status: mapMpStatusToSubscriptionStatus(mpSubscription.status || "pending"),
      startedAt: mpSubscription.date_created ? new Date(mpSubscription.date_created) : null,
      nextPaymentDate: mpSubscription.next_payment_date
        ? new Date(mpSubscription.next_payment_date)
        : null,
    },
  });
}

async function handlePaymentEvent(body: { data?: { id?: string } }) {
  const paymentId = body.data?.id;
  if (!paymentId) return;

  // Get payment details from MP
  const mpPayment = await getPaymentDetails(paymentId);

  if (!mpPayment || !mpPayment.external_reference) return;

  const externalRef = mpPayment.external_reference as string;
  if (!externalRef.startsWith("user_")) return;

  const userId = externalRef.replace("user_", "");

  // Record the payment
  await prisma.payment.upsert({
    where: { mpPaymentId: paymentId },
    create: {
      userId,
      mpPaymentId: paymentId,
      status: mpPayment.status || "unknown",
      amount: mpPayment.transaction_amount || 0,
      paidAt: mpPayment.date_approved ? new Date(mpPayment.date_approved as string) : null,
      rawPayload: mpPayment as object,
    },
    update: {
      status: mpPayment.status || "unknown",
      paidAt: mpPayment.date_approved ? new Date(mpPayment.date_approved as string) : null,
      rawPayload: mpPayment as object,
    },
  });

  // If payment is approved, ensure subscription is active
  if (mpPayment.status === "approved") {
    await prisma.subscription.updateMany({
      where: { userId },
      data: { status: "ACTIVE" },
    });
  }
}

async function handleAuthorizedPaymentEvent(body: { data?: { id?: string } }) {
  // Similar to payment event
  await handlePaymentEvent(body);
}

// Handle GET requests (MP sometimes sends GET for validation)
export async function GET() {
  return NextResponse.json({ status: "ok" });
}
