"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, Loader2, Book, MessageSquare, History, Shield } from "lucide-react";

const features = [
  { icon: Book, text: "Acesso ilimitado à Bíblia NVI" },
  { icon: MessageSquare, text: "Conversas ilimitadas com o assistente" },
  { icon: History, text: "Histórico de conversas salvo" },
  { icon: Shield, text: "Respostas fundamentadas nas Escrituras" },
];

export function PricingCard() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubscribe = async () => {
    setIsLoading(true);

    try {
      const response = await fetch("/api/billing/subscribe", {
        method: "POST",
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao criar assinatura");
      }

      // Redirect to Mercado Pago checkout
      window.location.href = data.initPoint;
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao processar assinatura",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-primary/20 shadow-lg">
      <CardHeader className="text-center pb-2">
        <CardTitle className="text-2xl">Assinatura Mensal</CardTitle>
        <CardDescription>
          Acesso completo ao Chatbot Gênesis
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="text-center">
          <span className="text-4xl font-bold">R$ 9,90</span>
          <span className="text-muted-foreground">/mês</span>
        </div>
        <ul className="space-y-3">
          {features.map((feature, i) => (
            <li key={i} className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                <feature.icon className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm">{feature.text}</span>
            </li>
          ))}
        </ul>
      </CardContent>
      <CardFooter>
        <Button
          onClick={handleSubscribe}
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4" />
              Assinar Agora
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}
