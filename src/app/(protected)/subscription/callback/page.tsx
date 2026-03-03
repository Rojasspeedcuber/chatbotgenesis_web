"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, CheckCircle, XCircle } from "lucide-react";

function CallbackContent() {
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const checkStatus = async () => {
      // Wait a bit for webhook to process
      await new Promise((resolve) => setTimeout(resolve, 2000));

      try {
        const response = await fetch("/api/billing/status");
        const data = await response.json();

        if (data.hasSubscription && ["ACTIVE", "AUTHORIZED"].includes(data.status)) {
          setStatus("success");
        } else {
          // Could be pending, check again
          await new Promise((resolve) => setTimeout(resolve, 3000));
          const retryResponse = await fetch("/api/billing/status");
          const retryData = await retryResponse.json();

          if (retryData.hasSubscription && ["ACTIVE", "AUTHORIZED", "PENDING"].includes(retryData.status)) {
            setStatus("success");
          } else {
            setStatus("error");
          }
        }
      } catch {
        setStatus("error");
      }
    };

    checkStatus();
  }, [searchParams]);

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        {status === "loading" && (
          <>
            <div className="flex justify-center mb-4">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
            <CardTitle>Processando pagamento...</CardTitle>
            <CardDescription>
              Aguarde enquanto confirmamos sua assinatura
            </CardDescription>
          </>
        )}
        {status === "success" && (
          <>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle>Assinatura confirmada!</CardTitle>
            <CardDescription>
              Seu acesso ao Chatbot Gênesis foi liberado
            </CardDescription>
          </>
        )}
        {status === "error" && (
          <>
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle>Houve um problema</CardTitle>
            <CardDescription>
              Não foi possível confirmar sua assinatura. Tente novamente ou entre em contato.
            </CardDescription>
          </>
        )}
      </CardHeader>
      <CardContent className="flex justify-center">
        {status === "success" && (
          <Button onClick={() => router.push("/chat")}>
            Começar a usar o Chat
          </Button>
        )}
        {status === "error" && (
          <Button onClick={() => router.push("/subscription")} variant="outline">
            Voltar para assinatura
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

export default function SubscriptionCallbackPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <Suspense
        fallback={
          <Card className="w-full max-w-md">
            <CardHeader className="text-center">
              <div className="flex justify-center mb-4">
                <Loader2 className="h-12 w-12 animate-spin text-primary" />
              </div>
              <CardTitle>Carregando...</CardTitle>
            </CardHeader>
          </Card>
        }
      >
        <CallbackContent />
      </Suspense>
    </div>
  );
}
