import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { checkSubscriptionAccess } from "@/lib/subscription";
import { ChatContainer } from "@/components/chat/chat-container";

export const metadata = {
  title: "Chat - Chatbot Gênesis",
  description: "Converse com o assistente bíblico Gênesis",
};

export default async function ChatPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const hasAccess = await checkSubscriptionAccess(session.user.id);

  if (!hasAccess) {
    redirect("/subscription");
  }

  return <ChatContainer />;
}
