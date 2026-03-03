import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "henriquer01@rojasdev.cloud";

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.email !== ADMIN_EMAIL && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const status = searchParams.get("status") || "";

    const where = status ? { status } : {};

    const [webhooks, total] = await Promise.all([
      prisma.webhookEvent.findMany({
        where,
        orderBy: { receivedAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.webhookEvent.count({ where }),
    ]);

    return NextResponse.json({
      webhooks: webhooks.map((w) => ({
        id: w.id,
        provider: w.provider,
        eventType: w.eventType,
        externalId: w.externalId,
        receivedAt: w.receivedAt,
        processedAt: w.processedAt,
        status: w.status,
        errorMessage: w.errorMessage,
        payload: w.payloadJson,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Admin webhooks error:", error);
    return NextResponse.json(
      { error: "Erro ao carregar webhooks" },
      { status: 500 }
    );
  }
}
