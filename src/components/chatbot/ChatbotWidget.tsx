import { useState, useRef, useEffect, useCallback } from "react";
import { MessageCircle, X, Send, Loader2, Bot, User, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Message {
  id: string;
  timestamp: string;
  role: "user" | "assistant";
  content: string;
  functionResults?: Array<{
    tipo: string;
    lead_id?: string;
    dados_capturados?: {
      nome?: string;
      email?: string;
      telefone?: string;
    };
  }>;
}

interface ChatbotWidgetProps {
  imovelId: string;
  imobiliariaId?: string;
  construtorId: string;
  imovelTitulo: string;
  imobiliariaNome?: string;
}

function getOrCreateSessionId(): string {
  const storageKey = "chatbot_session_id";
  let sessionId = localStorage.getItem(storageKey);
  
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    localStorage.setItem(storageKey, sessionId);
  }
  
  return sessionId;
}

export function ChatbotWidget({
  imovelId,
  imobiliariaId,
  construtorId,
  imovelTitulo,
  imobiliariaNome = "nossa equipe",
}: ChatbotWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [sessionId] = useState(getOrCreateSessionId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load existing conversation from localStorage
  useEffect(() => {
    const conversationKey = `chatbot_messages_${imovelId}`;
    const savedMessages = localStorage.getItem(conversationKey);
    
    if (savedMessages) {
      try {
        const parsed = JSON.parse(savedMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setMessages(parsed);
        }
      } catch (e) {
        console.error("Error parsing saved messages:", e);
      }
    }
  }, [imovelId]);

  // Save messages to localStorage
  useEffect(() => {
    if (messages.length > 0) {
      const conversationKey = `chatbot_messages_${imovelId}`;
      localStorage.setItem(conversationKey, JSON.stringify(messages));
    }
  }, [messages, imovelId]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  // Focus input when opening
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const sendMessage = useCallback(async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      role: "user",
      content: trimmedInput,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);
    setIsTyping(true);

    try {
      const { data, error } = await supabase.functions.invoke("chatbot-message", {
        body: {
          session_id: sessionId,
          mensagem_usuario: trimmedInput,
          imovel_id: imovelId,
          imobiliaria_id: imobiliariaId,
          construtora_id: construtorId,
        },
      });

      if (error) throw error;

      // Check for function results (lead captured, etc.)
      if (data?.function_results) {
        for (const result of data.function_results) {
          if (result.tipo === "lead_capturado") {
            setLeadCaptured(true);
            toast.success("Dados de contato registrados!", {
              description: "Nossa equipe entrará em contato em breve.",
              icon: <CheckCircle2 className="h-4 w-4" />,
            });
          } else if (result.tipo === "agendamento_criado") {
            toast.success("Visita agendada!", {
              description: "Você receberá uma confirmação em breve.",
              icon: <CheckCircle2 className="h-4 w-4" />,
            });
          }
        }
      }

      const assistantMessage: Message = {
        id: data?.mensagem_id || crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        role: "assistant",
        content: data?.resposta || "Desculpe, ocorreu um erro. Tente novamente.",
        functionResults: data?.function_results,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error: any) {
      console.error("Chatbot error:", error);
      
      let errorContent = "Desculpe, houve um problema na conexão. Por favor, tente novamente em alguns instantes.";
      
      // Handle rate limit and payment errors
      if (error?.message?.includes("429") || error?.status === 429) {
        errorContent = "Estamos com muitas solicitações. Aguarde alguns segundos e tente novamente.";
        toast.error("Limite de requisições", { description: "Aguarde um momento." });
      } else if (error?.message?.includes("402") || error?.status === 402) {
        errorContent = "Serviço temporariamente indisponível. Entre em contato diretamente conosco.";
      }
      
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        timestamp: new Date().toISOString(),
        role: "assistant",
        content: errorContent,
      };
      
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
    }
  }, [inputValue, isLoading, sessionId, imovelId, imobiliariaId, construtorId]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearConversation = () => {
    const conversationKey = `chatbot_messages_${imovelId}`;
    localStorage.removeItem(conversationKey);
    setMessages([]);
  };

  // Initial greeting message
  const greetingMessage: Message = {
    id: "greeting",
    timestamp: new Date().toISOString(),
    role: "assistant",
    content: `Olá! 👋 Sou a assistente virtual da ${imobiliariaNome}. Estou aqui para tirar suas dúvidas sobre "${imovelTitulo}". Como posso ajudar?`,
  };

  const displayMessages = messages.length > 0 ? messages : [greetingMessage];

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-all hover:scale-105 hover:shadow-xl",
          isOpen && "hidden"
        )}
        aria-label="Abrir chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[500px] w-[380px] max-w-[calc(100vw-48px)] flex-col overflow-hidden rounded-2xl border bg-background shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b bg-primary px-4 py-3 text-primary-foreground">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-foreground/20">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold">Assistente Virtual</h3>
                <p className="text-xs opacity-80">Online • Resposta imediata</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Messages */}
          <ScrollArea className="flex-1 p-4" ref={scrollRef}>
            <div className="space-y-4">
              {displayMessages.map((message) => (
                <div
                  key={message.id}
                  className={cn(
                    "flex gap-2",
                    message.role === "user" ? "flex-row-reverse" : "flex-row"
                  )}
                >
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted"
                    )}
                  >
                    {message.role === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>
                  <div
                    className={cn(
                      "max-w-[75%] rounded-2xl px-4 py-2.5 text-sm",
                      message.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-sm"
                        : "bg-muted rounded-bl-sm"
                    )}
                  >
                    <p className="whitespace-pre-wrap">{message.content}</p>
                    <p
                      className={cn(
                        "mt-1 text-[10px]",
                        message.role === "user"
                          ? "text-primary-foreground/60"
                          : "text-muted-foreground"
                      )}
                    >
                      {new Date(message.timestamp).toLocaleTimeString("pt-BR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex gap-2">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="flex items-center gap-1 rounded-2xl rounded-bl-sm bg-muted px-4 py-3">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.3s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40 [animation-delay:-0.15s]" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-foreground/40" />
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>

          {/* Input */}
          <div className="border-t p-3">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Digite sua mensagem..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={!inputValue.trim() || isLoading}
                size="icon"
              >
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
            <p className="mt-2 text-center text-[10px] text-muted-foreground">
              Powered by AI • 
              <button
                onClick={clearConversation}
                className="ml-1 underline hover:no-underline"
              >
                Limpar conversa
              </button>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
