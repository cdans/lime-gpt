import { Message, Citation, LLMMessage } from "@/types";
import { getLLMAdapter } from "@/lib/adapters/llm.adapter";
import { getRAGService } from "@/lib/services/rag.service";

/**
 * Chat Service - Core business logic for chat functionality
 * Orchestrates RAG, LLM, and message handling
 */
export class ChatService {
  private llmAdapter = getLLMAdapter();
  private ragService = getRAGService();

  /**
   * Process a user message and stream the response
   * @param userMessage - The user's message
   * @param history - Previous messages in the conversation
   * @returns AsyncGenerator yielding response chunks and citations
   */
  async *processMessage(
    userMessage: string,
    history: Message[]
  ): AsyncGenerator<
    | { type: "text"; content: string }
    | { type: "citations"; citations: Citation[] },
    void,
    unknown
  > {
    try {
      // 1. Search for relevant context using RAG
      const { context, citations } = this.ragService.searchContext(userMessage);

      // 2. Build system prompt with context
      const systemPrompt = this.buildSystemPrompt(context);

      // 3. Convert message history to LLM format
      const llmMessages: LLMMessage[] = [
        ...history.map((msg) => ({
          role: msg.role,
          content: msg.content,
        })),
        {
          role: "user" as const,
          content: userMessage,
        },
      ];

      // 4. Yield citations first (if any)
      if (citations.length > 0) {
        yield { type: "citations", citations };
      }

      // 5. Stream response from LLM
      for await (const chunk of this.llmAdapter.streamChat(
        llmMessages,
        systemPrompt
      )) {
        yield { type: "text", content: chunk };
      }
    } catch (error) {
      console.error("Chat service error:", error);
      throw new Error("Fehler bei der Verarbeitung Ihrer Nachricht");
    }
  }

  /**
   * Build system prompt with RAG context
   */
  private buildSystemPrompt(ragContext: string): string {
    const basePrompt = `Du bist limetaxIQ, ein KI-Assistent für deutsche Steuerberater und Steuerkanzleien.

Deine Aufgaben:
- Beantworte steuerrechtliche Fragen präzise und mit Quellenangaben
- Unterstütze bei der Mandantenvorbereitung und Fristenverwaltung
- Erkläre komplexe Sachverhalte verständlich für Steuerberater
- Gib IMMER Quellen an, wenn du dich auf Gesetze beziehst (z.B. § 1 AO, § 15 EStG)
- Nutze die bereitgestellten Informationen aus der Wissensdatenbank

Wichtige Hinweise:
- Antworte immer auf Deutsch
- Sei professionell und präzise
- Bei Unsicherheit: Weise auf Interpretationsspielräume hin
- Wenn keine relevanten Informationen verfügbar sind, sage das ehrlich

Verfügbare Informationen aus der Wissensdatenbank:

${ragContext}

---

Beantworte die Frage des Nutzers basierend auf den obigen Informationen. Zitiere relevante Paragraphen und Quellen.`;

    return basePrompt;
  }

  /**
   * Get a non-streaming response (useful for testing)
   */
  async getResponse(userMessage: string, history: Message[]): Promise<string> {
    const { context } = this.ragService.searchContext(userMessage);
    const systemPrompt = this.buildSystemPrompt(context);

    const llmMessages: LLMMessage[] = [
      ...history.map((msg) => ({
        role: msg.role,
        content: msg.content,
      })),
      {
        role: "user" as const,
        content: userMessage,
      },
    ];

    return await this.llmAdapter.getCompletion(llmMessages, systemPrompt);
  }
}

// Singleton instance
let chatServiceInstance: ChatService | null = null;

export function getChatService(): ChatService {
  if (!chatServiceInstance) {
    chatServiceInstance = new ChatService();
  }
  return chatServiceInstance;
}
