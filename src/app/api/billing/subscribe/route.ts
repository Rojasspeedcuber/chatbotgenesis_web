import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { createSubscription } from "@/lib/mercadopago";

export async function POST() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check if user already has an active subscription
    const existingSubscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (existingSubscription && ["ACTIVE", "AUTHORIZED"].includes(existingSubscription.status)) {
      return NextResponse.json(
        { error: "Você já possui uma assinatura ativa" },
        { status: 400 }
      );
    }

    // Create subscription with Mercado Pago
    const backUrl = `${process.env.APP_URL}/subscription/callback`;
    const { initPoint, preapprovalId } = await createSubscription({
      userEmail: session.user.email,
      userId: session.user.id,
      backUrl,
    });

    // Create or update subscription record
    if (existingSubscription) {
      await prisma.subscription.update({
        where: { userId: session.user.id },
        data: {
          status: "PENDING",
          mpPreapprovalId: preapprovalId,
          externalReference: `user_${session.user.id}`,
        },
      });
    } else {
      await prisma.subscription.create({
        data: {
          userId: session.user.id,
          status: "PENDING",
          mpPreapprovalId: preapprovalId,
          externalReference: `user_${session.user.id}`,
        },
      });
    }

    return NextResponse.json({ initPoint });
  } catch (error) {
    console.error("Subscribe error:", error);
    return NextResponse.json(
      { error: "Erro ao criar assinatura" },
      { status: 500 }
    );
  }
}
