"use client";

import { useState, useRef, useEffect } from "react";
import { ChatMessage } from "./chat-message";
import { ChatInput } from "./chat-input";
import { ChatSidebar } from "./chat-sidebar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Book } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export function ChatContainer() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (content: string) => {
    // Add user message optimistically
    const userMessage: Message = {
      id: `temp-${Date.now()}`,
      role: "user",
      content,
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const response = await fetch("/api/chat/message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: content,
          sessionId: currentSessionId,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Erro ao enviar mensagem");
      }

      // Update session ID if new session was created
      if (!currentSessionId) {
        setCurrentSessionId(data.sessionId);
      }

      // Add assistant message
      setMessages((prev) => [
        ...prev,
        {
          id: data.message.id,
          role: "assistant",
          content: data.message.content,
        },
      ]);
    } catch (error) {
      toast({
        title: "Erro",
        description: error instanceof Error ? error.message : "Erro ao enviar mensagem",
        variant: "destructive",
      });
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setMessages([]);
    setCurrentSessionId(null);
  };

  const handleSelectSession = async (sessionId: string) => {
    try {
      const response = await fetch(`/api/chat/session/${sessionId}`);
      const data = await response.json();

      if (response.ok) {
        setCurrentSessionId(sessionId);
        setMessages(
          data.session.messages.map((m: { id: string; role: string; content: string }) => ({
            id: m.id,
            role: m.role as "user" | "assistant",
            content: m.content,
          }))
        );
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao carregar conversa",
        variant: "destructive",
      });
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    try {
      await fetch(`/api/chat/session/${sessionId}`, { method: "DELETE" });
      if (sessionId === currentSessionId) {
        handleNewChat();
      }
    } catch {
      toast({
        title: "Erro",
        description: "Erro ao excluir conversa",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex h-screen bg-background">
      <ChatSidebar
        currentSessionId={currentSessionId}
        onNewChat={handleNewChat}
        onSelectSession={handleSelectSession}
        onDeleteSession={handleDeleteSession}
      />
      <main className="flex-1 flex flex-col h-full">
        <header className="h-14 border-b flex items-center justify-center px-4">
          <h1 className="text-lg font-semibold flex items-center gap-2">
            <Book className="h-5 w-5 text-primary" />
            Chatbot Gênesis
          </h1>
        </header>
        <ScrollArea className="flex-1 p-4">
          <div className="max-w-3xl mx-auto space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 space-y-4">
                <Book className="h-16 w-16 mx-auto text-primary/50" />
                <h2 className="text-xl font-semibold">Bem-vindo ao Chatbot Gênesis</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Faça perguntas sobre a Bíblia, busque orientação espiritual ou
                  explore os ensinamentos das Escrituras. Estou aqui para ajudar
                  em sua jornada de fé.
                </p>
                <div className="grid gap-2 max-w-sm mx-auto text-sm">
                  <p className="text-muted-foreground">Experimente perguntar:</p>
                  <button
                    onClick={() => handleSend("O que a Bíblia diz sobre o amor?")}
                    className="p-3 rounded-lg border hover:bg-accent text-left"
                  >
                    O que a Bíblia diz sobre o amor?
                  </button>
                  <button
                    onClick={() => handleSend("Como posso ter mais fé?")}
                    className="p-3 rounded-lg border hover:bg-accent text-left"
                  >
                    Como posso ter mais fé?
                  </button>
                  <button
                    onClick={() => handleSend("Qual é o significado de João 3:16?")}
                    className="p-3 rounded-lg border hover:bg-accent text-left"
                  >
                    Qual é o significado de João 3:16?
                  </button>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <ChatMessage
                  key={message.id}
                  role={message.role}
                  content={message.content}
                />
              ))
            )}
            {isLoading && (
              <div className="flex items-center gap-2 text-muted-foreground">
                <div className="animate-pulse flex gap-1">
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
                <span className="text-sm">Gênesis está pensando...</span>
              </div>
            )}
            <div ref={scrollRef} />
          </div>
        </ScrollArea>
        <div className="border-t p-4">
          <div className="max-w-3xl mx-auto">
            <ChatInput onSend={handleSend} isLoading={isLoading} />
          </div>
        </div>
      </main>
    </div>
  );
}
