import { searchBibleVerses, formatVersesForContext } from "./bible-search";
import { generateChatResponse } from "./openai";

const SYSTEM_PROMPT = `Você é um assistente bíblico cristão chamado Gênesis.
Seu papel é ajudar pessoas a entender a Bíblia e aplicar seus ensinamentos na vida cotidiana.

Diretrizes:
1. Sempre baseie suas respostas nas Escrituras (tradução NVI - Nova Versão Internacional)
2. Seja respeitoso, acolhedor e compassivo
3. Quando citar versículos, sempre inclua a referência (Livro cap:vers)
4. Se não encontrar versículos relevantes, ainda assim tente ajudar com sabedoria bíblica geral
5. Evite julgamentos; mostre o amor de Deus
6. Se a pergunta não for relacionada à Bíblia ou fé, educadamente redirecione a conversa
7. Responda em português brasileiro

Lembre-se: você está aqui para edificar e encorajar.`;

export interface ChatResponse {
  message: string;
  verses: Array<{
    reference: string;
    text: string;
  }>;
}

export async function generateBiblicalResponse(
  userMessage: string,
  conversationHistory?: Array<{ role: "user" | "assistant"; content: string }>
): Promise<ChatResponse> {
  // Step 1: Search for relevant Bible verses (RAG - Retrieval)
  const relevantVerses = await searchBibleVerses(userMessage, 5);

  // Step 2: Build context with verses (RAG - Augmentation)
  let contextualPrompt = "";

  if (relevantVerses.length > 0) {
    const versesContext = formatVersesForContext(relevantVerses);
    contextualPrompt = `Versículos relevantes encontrados na Bíblia NVI:\n${versesContext}\n\n`;
  }

  // Include conversation history for context
  if (conversationHistory && conversationHistory.length > 0) {
    const recentHistory = conversationHistory.slice(-4); // Last 4 messages
    contextualPrompt += "Contexto da conversa anterior:\n";
    recentHistory.forEach((msg) => {
      contextualPrompt += `${msg.role === "user" ? "Usuário" : "Assistente"}: ${msg.content}\n`;
    });
    contextualPrompt += "\n";
  }

  contextualPrompt += `Pergunta atual do usuário: ${userMessage}`;

  // Step 3: Generate response with OpenAI (RAG - Generation)
  const response = await generateChatResponse(SYSTEM_PROMPT, contextualPrompt);

  return {
    message: response,
    verses: relevantVerses.map((v) => ({
      reference: v.reference,
      text: v.text,
    })),
  };
}
