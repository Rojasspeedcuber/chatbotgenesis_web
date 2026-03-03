"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { formatDate } from "@/lib/utils";
import { Check, Loader2, MessageSquare, AlertTriangle } from "lucide-react";
import type { Subscription } from "@prisma/client";

interface SubscriptionStatusProps {
  subscription: Subscription;
}

const statusLabels: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "success" | "warning" }> = {
  ACTIVE: { label: "Ativa", variant: "success" },
  AUTHORIZED: { label: "Autorizada", variant: "success" },
  PENDING: { label: "Pendente", variant: "warning" },
  PAUSED: { label: "Pausada", variant: "secondary" },
  CANCELLED: { label: "Cancelada", variant: "destructive" },
  PAST_DUE: { label: "Atrasada", variant: "destructive" },
};

export function SubscriptionStatus({ subscription }: SubscriptionStatusProps) {
  const [isCancelling, setIsCancelling] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const statusInfo = statusLabels[subscription.status] || { label: subscription.status, variant: "secondary" as const };
  const isActive = ["ACTIVE", "AUTHORIZED"].includes(subscription.status);

  const handleCancel = async () => {
    if (!confirm("Tem certeza que deseja cancelar sua assinatura? Você perderá acesso ao chat.")) {
      return;
    }

    setIsCancelling(true);

    try {
      const response = await fetch("/api/billing/cancel", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao cancelar assinatura");
      }

      toast({
        title: "Assinatura cancelada",
        description: "Sua assinatura foi cancelada com sucesso.",
      });

      router.refresh();
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao cancelar assinatura",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  const handleGoToChat = () => {
    router.push("/chat");
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center pb-2">
        <div className="flex justify-center mb-2">
          <Badge variant={statusInfo.variant}>{statusInfo.label}</Badge>
        </div>
        <CardTitle className="text-2xl">Sua Assinatura</CardTitle>
        <CardDescription>
          Gerencie sua assinatura do Chatbot Gênesis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-muted/50 p-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Plano</span>
            <span className="text-sm font-medium">Mensal - R$ 9,90</span>
          </div>
          {subscription.startedAt && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Início</span>
              <span className="text-sm font-medium">
                {formatDate(subscription.startedAt)}
              </span>
            </div>
          )}
          {subscription.nextPaymentDate && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Próxima cobrança</span>
              <span className="text-sm font-medium">
                {formatDate(subscription.nextPaymentDate)}
              </span>
            </div>
          )}
        </div>

        {!isActive && (
          <div className="rounded-lg bg-yellow-50 dark:bg-yellow-900/20 p-4 flex gap-3">
            <AlertTriangle className="h-5 w-5 text-yellow-600 shrink-0" />
            <p className="text-sm text-yellow-800 dark:text-yellow-200">
              Sua assinatura não está ativa. Renove para continuar usando o chat.
            </p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex flex-col gap-2">
        {isActive && (
          <>
            <Button
              onClick={handleGoToChat}
              className="w-full"
              size="lg"
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              Ir para o Chat
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="w-full"
              disabled={isCancelling}
            >
              {isCancelling ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Cancelar Assinatura
            </Button>
          </>
        )}
        {!isActive && (
          <Button
            onClick={() => router.refresh()}
            className="w-full"
            size="lg"
          >
            <Check className="mr-2 h-4 w-4" />
            Renovar Assinatura
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
