import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { getUserWithSubscription } from "@/lib/subscription";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateTime } from "@/lib/utils";
import Link from "next/link";
import { User, Mail, Calendar, CreditCard, ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Perfil - Chatbot Gênesis",
  description: "Gerencie seu perfil",
};

export default async function ProfilePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const user = await getUserWithSubscription(session.user.id);

  if (!user) {
    redirect("/login");
  }

  const statusLabels: Record<string, { label: string; variant: "success" | "warning" | "destructive" | "secondary" }> = {
    ACTIVE: { label: "Ativa", variant: "success" },
    AUTHORIZED: { label: "Autorizada", variant: "success" },
    PENDING: { label: "Pendente", variant: "warning" },
    PAUSED: { label: "Pausada", variant: "secondary" },
    CANCELLED: { label: "Cancelada", variant: "destructive" },
    PAST_DUE: { label: "Atrasada", variant: "destructive" },
  };

  const subscriptionStatus = user.subscription
    ? statusLabels[user.subscription.status] || { label: user.subscription.status, variant: "secondary" as const }
    : null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-4">
      <div className="container mx-auto max-w-2xl py-8">
        <div className="mb-6">
          <Link href="/chat">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar ao Chat
            </Button>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Meu Perfil
            </CardTitle>
            <CardDescription>
              Informações da sua conta
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <User className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Nome</p>
                  <p className="font-medium">{user.name || "Não informado"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Mail className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Membro desde</p>
                  <p className="font-medium">{formatDateTime(user.createdAt)}</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Assinatura</p>
                  {subscriptionStatus ? (
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant={subscriptionStatus.variant}>
                        {subscriptionStatus.label}
                      </Badge>
                    </div>
                  ) : (
                    <p className="text-sm">Sem assinatura</p>
                  )}
                </div>
                <Link href="/subscription">
                  <Button variant="outline" size="sm">
                    Gerenciar
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
