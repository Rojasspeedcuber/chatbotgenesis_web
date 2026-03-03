import { NextResponse } from "next/server";
import { hash } from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { registerSchema } from "@/lib/validations";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Validate input (Zod)
    const parsed = registerSchema.safeParse(body);

    if (!parsed.success) {
      const { fieldErrors, formErrors } = parsed.error.flatten();

      // Pega uma mensagem amigável: primeiro tenta erro por campo, depois erro geral
      const firstFieldError =
        Object.values(fieldErrors).flat().find(Boolean) ?? null;

      const message =
        firstFieldError ??
        formErrors?.[0] ??
        parsed.error.issues?.[0]?.message ??
        "Dados inválidos.";

      return NextResponse.json(
        {
          error: message,
          // Opcional: útil para frontend exibir erros por campo
          fieldErrors,
          formErrors,
        },
        { status: 400 }
      );
    }

    // Normaliza email (evita duplicidade por maiúsculas/minúsculas e espaços)
    const email = parsed.data.email.trim().toLowerCase();
    const { password, name } = parsed.data;

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "Este email já está cadastrado" },
        { status: 409 }
      );
    }

    // Hash password
    const passwordHash = await hash(password, 12);

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        passwordHash,
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    return NextResponse.json(
      {
        message: "Usuário criado com sucesso",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);

    // Se quiser, você pode diferenciar JSON inválido aqui,
    // mas manter 500 é aceitável e simples.
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}