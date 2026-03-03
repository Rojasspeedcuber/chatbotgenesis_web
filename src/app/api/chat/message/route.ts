import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { checkSubscriptionAccess } from "@/lib/subscription";
import { generateBiblicalResponse } from "@/lib/chat-ai";
import { chatMessageSchema } from "@/lib/validations";

export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    // Check subscription access
    const hasAccess = await checkSubscriptionAccess(session.user.id);
    if (!hasAccess) {
      return NextResponse.json(
        { error: "Assinatura necessária para usar o chat" },
        { status: 403 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = chatMessageSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues?.[0]?.message ?? "Dados inválidos." },
        { status: 400 }
      );
    }

    const { message, sessionId } = validationResult.data;

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await prisma.chatSession.findFirst({
        where: {
          id: sessionId,
          userId: session.user.id,
        },
        include: {
          messages: {
            orderBy: { createdAt: "asc" },
            take: 10,
          },
        },
      });

      if (!chatSession) {
        return NextResponse.json(
          { error: "Sessão não encontrada" },
          { status: 404 }
        );
      }
    } else {
      // Create new session
      chatSession = await prisma.chatSession.create({
        data: {
          userId: session.user.id,
          title: message.substring(0, 50) + (message.length > 50 ? "..." : ""),
        },
        include: {
          messages: true,
        },
      });
    }

    // Save user message
    await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "user",
        content: message,
      },
    });

    // Get conversation history for context
    const conversationHistory = chatSession.messages.map((msg) => ({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    // Generate AI response
    const aiResponse = await generateBiblicalResponse(message, conversationHistory);

    // Save assistant message
    const assistantMessage = await prisma.chatMessage.create({
      data: {
        sessionId: chatSession.id,
        role: "assistant",
        content: aiResponse.message,
      },
    });

    // Update session's updatedAt
    await prisma.chatSession.update({
      where: { id: chatSession.id },
      data: { updatedAt: new Date() },
    });

    return NextResponse.json({
      sessionId: chatSession.id,
      message: {
        id: assistantMessage.id,
        role: "assistant",
        content: aiResponse.message,
        createdAt: assistantMessage.createdAt,
      },
      verses: aiResponse.verses,
    });
  } catch (error) {
    console.error("Chat error:", error);
    return NextResponse.json(
      { error: "Erro ao processar mensagem" },
      { status: 500 }
    );
  }
}
