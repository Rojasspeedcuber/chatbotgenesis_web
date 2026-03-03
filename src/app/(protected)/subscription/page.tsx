import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkSubscriptionAccess, getSubscriptionStatus } from "@/lib/subscription";
import { PricingCard } from "@/components/billing/pricing-card";
import { SubscriptionStatus } from "@/components/billing/subscription-status";
import { Book } from "lucide-react";

export const metadata = {
  title: "Assinatura - Chatbot Gênesis",
  description: "Assine o Chatbot Gênesis para ter acesso completo",
};

export default async function SubscriptionPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const hasAccess = await checkSubscriptionAccess(session.user.id);
  const subscription = await getSubscriptionStatus(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <div className="flex justify-center mb-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <Book className="h-8 w-8 text-primary" />
            </div>
          </div>
          <h1 className="text-3xl font-bold mb-2">Chatbot Gênesis</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Seu assistente bíblico pessoal, pronto para responder suas perguntas
            e guiá-lo em sua jornada espiritual.
          </p>
        </div>

        <div className="flex justify-center">
          {hasAccess && subscription ? (
            <SubscriptionStatus subscription={subscription} />
          ) : (
            <PricingCard />
          )}
        </div>
      </div>
    </div>
  );
}
