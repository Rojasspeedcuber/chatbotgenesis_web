import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, CreditCard, MessageSquare, Webhook } from "lucide-react";

export const metadata = {
  title: "Admin Dashboard - Chatbot Gênesis",
};

export default async function AdminPage() {
  const [
    totalUsers,
    activeSubscriptions,
    totalMessages,
    recentWebhooks,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.subscription.count({
      where: { status: { in: ["ACTIVE", "AUTHORIZED"] } },
    }),
    prisma.chatMessage.count(),
    prisma.webhookEvent.count({
      where: {
        receivedAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
        },
      },
    }),
  ]);

  const stats = [
    {
      title: "Total de Usuários",
      value: totalUsers,
      icon: Users,
      color: "text-blue-500",
    },
    {
      title: "Assinaturas Ativas",
      value: activeSubscriptions,
      icon: CreditCard,
      color: "text-green-500",
    },
    {
      title: "Total de Mensagens",
      value: totalMessages,
      icon: MessageSquare,
      color: "text-purple-500",
    },
    {
      title: "Webhooks (24h)",
      value: recentWebhooks,
      icon: Webhook,
      color: "text-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral do Chatbot Gênesis
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value.toLocaleString("pt-BR")}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
