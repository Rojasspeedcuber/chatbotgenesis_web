import { MercadoPagoConfig, PreApproval, Payment } from "mercadopago";

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || "",
});

export const preApproval = new PreApproval(client);
export const payment = new Payment(client);

export interface CreateSubscriptionParams {
  userEmail: string;
  userId: string;
  backUrl: string;
}

export async function createSubscription({
  userEmail,
  userId,
  backUrl,
}: CreateSubscriptionParams): Promise<{ initPoint: string; preapprovalId: string }> {
  const result = await preApproval.create({
    body: {
      reason: "Chatbot Gênesis - Assinatura Mensal",
      auto_recurring: {
        frequency: 1,
        frequency_type: "months",
        transaction_amount: 9.9, // R$ 9,90/mês
        currency_id: "BRL",
      },
      back_url: backUrl,
      external_reference: `user_${userId}`,
      payer_email: userEmail,
    },
  });

  if (!result.init_point || !result.id) {
    throw new Error("Failed to create subscription");
  }

  return {
    initPoint: result.init_point,
    preapprovalId: result.id,
  };
}

export async function getSubscriptionStatus(preapprovalId: string) {
  const result = await preApproval.get({ id: preapprovalId });
  return result;
}

export async function cancelSubscription(preapprovalId: string) {
  const result = await preApproval.update({
    id: preapprovalId,
    body: {
      status: "cancelled",
    },
  });
  return result;
}

export async function getPaymentDetails(paymentId: string) {
  const result = await payment.get({ id: paymentId });
  return result;
}

export function mapMpStatusToSubscriptionStatus(
  mpStatus: string
): "PENDING" | "AUTHORIZED" | "ACTIVE" | "PAUSED" | "CANCELLED" | "PAST_DUE" {
  const statusMap: Record<string, "PENDING" | "AUTHORIZED" | "ACTIVE" | "PAUSED" | "CANCELLED" | "PAST_DUE"> = {
    pending: "PENDING",
    authorized: "AUTHORIZED",
    active: "ACTIVE",
    paused: "PAUSED",
    cancelled: "CANCELLED",
    canceled: "CANCELLED",
  };
  return statusMap[mpStatus.toLowerCase()] || "PENDING";
}
