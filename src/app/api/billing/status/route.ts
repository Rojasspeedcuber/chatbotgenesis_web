import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const subscription = await prisma.subscription.findUnique({
      where: { userId: session.user.id },
    });

    if (!subscription) {
      return NextResponse.json({
        hasSubscription: false,
        status: null,
      });
    }

    return NextResponse.json({
      hasSubscription: true,
      status: subscription.status,
      startedAt: subscription.startedAt,
      nextPaymentDate: subscription.nextPaymentDate,
    });
  } catch (error) {
    console.error("Status error:", error);
    return NextResponse.json(
      { error: "Erro ao verificar status" },
      { status: 500 }
    );
  }
}
