import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

export const dynamic = "force-dynamic";

const ADMIN_EMAIL = "henriquer01@rojasdev.cloud";

const updateAccessSchema = z.object({
  grantAccess: z.boolean(),
});

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();

    if (!session?.user || (session.user.email !== ADMIN_EMAIL && session.user.role !== "ADMIN")) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 403 });
    }

    const { id } = await params;
    const body = await request.json();

    const validationResult = updateAccessSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Dados inválidos" },
        { status: 400 }
      );
    }

    const { grantAccess } = validationResult.data;

    const user = await prisma.user.findUnique({
      where: { id },
      include: { subscription: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Usuário não encontrado" },
        { status: 404 }
      );
    }

    if (grantAccess) {
      // Grant access by creating/updating subscription
      await prisma.subscription.upsert({
        where: { userId: id },
        create: {
          userId: id,
          status: "ACTIVE",
          startedAt: new Date(),
          externalReference: `admin_granted_${Date.now()}`,
        },
        update: {
          status: "ACTIVE",
          startedAt: new Date(),
          canceledAt: null,
        },
      });
    } else {
      // Revoke access by cancelling subscription
      if (user.subscription) {
        await prisma.subscription.update({
          where: { userId: id },
          data: {
            status: "CANCELLED",
            canceledAt: new Date(),
          },
        });
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Update access error:", error);
    return NextResponse.json(
      { error: "Erro ao atualizar acesso" },
      { status: 500 }
    );
  }
}
