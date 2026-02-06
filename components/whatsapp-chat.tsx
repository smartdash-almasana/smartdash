"use client";

import { useState, useEffect, useRef } from "react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MoreVertical, CheckCheck, Bot, Signal, Wifi } from "lucide-react";
import { cn } from "@/lib/utils";
import { getEstadoToken } from "@/lib/ui/risk-tokens";

// Interfaz local para pasos de mitigación (alineada a español)
interface MitigationStep {
  step_number?: string | number;
  title: string;
  description: string;
  estado?: string; // 'Pendiente' | 'En Proceso' | 'Completado' | 'Descartado'
}

interface ChatMessage {
  id: string;
  role: "system" | "user";
  content: string;
  timestamp: string;
}

interface NotificationInput {
  id?: string;
  message?: string;
  text?: string;
  impact?: string;
  timestamp?: string;
}

interface WhatsAppChatProps {
  initialMessages: NotificationInput[];
  mitigationSteps: MitigationStep[];
  className?: string;
}

export function WhatsAppChat({ initialMessages, mitigationSteps, className }: WhatsAppChatProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  // Manejo defensivo de datos
  const safeMessages = initialMessages ?? [];
  const safeSteps = mitigationSteps ?? [];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  const handleBotResponse = async (userText: string) => {
    setIsTyping(true);
    await new Promise(r => setTimeout(r, 1500));

    let replyContent = "";
    const cleanInput = userText.trim();
    const stepNumberToFind = parseInt(cleanInput);

    if (!isNaN(stepNumberToFind) && stepNumberToFind > 0) {
      const step = safeSteps.find((s, index) => {
        const explicitNumber = s.step_number ? Number(s.step_number) : null;
        return explicitNumber === stepNumberToFind || (index + 1) === stepNumberToFind;
      });

      if (step) {
        // Usa token centralizado para estado
        const estadoToken = getEstadoToken(step.estado);
        replyContent = `🛡️ *PROTOCOLO ${stepNumberToFind}*\n\n*${step.title}*\n\n${step.description}\n\n_Estado actual: ${estadoToken.icon} ${estadoToken.label}_`;
      } else {
        replyContent = `⚠️ Lo siento, el protocolo *${stepNumberToFind}* no está en mi base de datos actual. ¿Deseas ver el menú de nuevo?`;
      }
    }
    else if (/(listo|ok|hecho|entendido|gracias|aplicar)/i.test(cleanInput)) {
      replyContent = `✅ *Excelente.* He marcado la acción como "En Proceso" en el sistema central. El Score de Riesgo se recalculará automáticamente tras la próxima auditoría.`;
    }
    else if (/(menu|menú|ayuda|help|opciones)/i.test(cleanInput)) {
      const menuSteps = safeSteps.map((s, i) => {
        const num = s.step_number || i + 1;
        const token = getEstadoToken(s.estado);
        return `🔹 *${num}* - ${s.title} ${token.icon}`;
      }).join("\n");
      replyContent = `📋 *MENÚ DE PROTOCOLOS*\n\n${menuSteps || "_Sin protocolos disponibles_"}\n\nEscribe el *número* para ver detalles.`;
    }
    else {
      replyContent = "No comprendo esa instrucción. Por favor, escribe el *número* de la acción que deseas ejecutar, o escribe *menú* para ver opciones.";
    }

    const botMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "system",
      content: replyContent,
      timestamp: getCurrentTime()
    };

    setMessages(prev => [...prev, botMsg]);
    setIsTyping(false);
  };

  useEffect(() => {
    if (safeMessages.length === 0) return;
    let isCancelled = false;

    const runSequence = async () => {
      setMessages([]);
      const dbNotification = safeMessages[0];
      const notificationText = dbNotification.message || dbNotification.text || "Alerta de riesgo detectada";
      const impactText = dbNotification.impact || "Impacto en evaluación";

      await new Promise(r => setTimeout(r, 1000));
      if (isCancelled) return;

      const msg1: ChatMessage = {
        id: "sys-1",
        role: "system",
        content: `🚨 *ALERTA DE RIESGO*\n\n${notificationText}\n\n📉 Impacto Proyectado: *${impactText}*`,
        timestamp: getCurrentTime()
      };
      setMessages([msg1]);

      setIsTyping(true);
      await new Promise(r => setTimeout(r, 2000));
      if (isCancelled) return;
      setIsTyping(false);

      const menuSteps = safeSteps.map((s, i) => {
        const num = s.step_number || i + 1;
        const token = getEstadoToken(s.estado);
        return `🔹 *${num}* - ${s.title} ${token.icon}`;
      }).join("\n");

      const msg2: ChatMessage = {
        id: "sys-2",
        role: "system",
        content: `🤖 *Asistente SmartDash*\n\nHe diseñado un plan de acción inmediato. Selecciona una opción para ver detalles:\n\n${menuSteps || "_Cargando protocolos..._"}\n\n¿Por cuál deseas comenzar?`,
        timestamp: getCurrentTime()
      };
      setMessages(prev => [...prev, msg2]);
    };

    runSequence();
    return () => { isCancelled = true; };
  }, [safeMessages, safeSteps]);

  const handleSend = () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: getCurrentTime()
    };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    handleBotResponse(input);
  };

  return (
    <div className={cn("flex h-full items-center justify-center p-4", className)}>
      <div className="relative w-full max-w-[340px] h-[680px] bg-slate-950 rounded-[3rem] p-3 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.5)] border-[4px] border-slate-800 ring-2 ring-slate-900 overflow-hidden">
        {/* Notch Cover */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-2xl z-50 flex items-center justify-center">
          <div className="w-1.5 h-1.5 rounded-full bg-slate-800 mr-2" />
          <div className="w-8 h-1 bg-slate-800 rounded-full" />
        </div>

        <div className="flex flex-col h-full bg-[#efeae2] relative overflow-hidden font-sans rounded-[2.2rem] z-10 border border-slate-900/10">
          <div className="absolute inset-0 opacity-[0.05] bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat pointer-events-none" />

          {/* Status Bar */}
          <div className="bg-white/80 backdrop-blur-md px-6 py-2 flex justify-between items-center text-[10px] font-bold text-slate-900 z-20 pt-6">
            <span>SmartDash</span>
            <div className="flex items-center gap-1.5">
              <Signal size={10} strokeWidth={3} />
              <Wifi size={10} strokeWidth={3} />
              <div className="relative w-4 h-2 border border-slate-900 rounded-[1px] flex items-center px-[1px]">
                <div className="h-full w-[80%] bg-slate-900" />
                <div className="absolute -right-[2px] w-[2px] h-1 bg-slate-900 rounded-r-full" />
              </div>
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 bg-white/90 backdrop-blur-sm border-b border-slate-200 z-10">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Avatar className="h-10 w-10 border-2 border-emerald-100 shadow-sm">
                  <AvatarFallback className="bg-orange-600 text-white"><Bot size={20} className="fill-current" /></AvatarFallback>
                </Avatar>
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
              </div>
              <div className="flex flex-col">
                <span className="font-black text-slate-900 text-xs tracking-tight flex items-center gap-1">
                  SD Audit Bot <CheckCheck className="text-blue-500 h-3 w-3" />
                </span>
                <span className="text-[10px] text-emerald-600 font-black uppercase tracking-widest">
                  {isTyping ? "Escribiendo..." : "Online"}
                </span>
              </div>
            </div>
            <Button size="icon" variant="ghost" className="text-slate-400 hover:text-orange-600 h-8 w-8">
              <MoreVertical size={18} />
            </Button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 relative z-10 scroll-smooth no-scrollbar">
            {messages.map((msg) => (
              <div key={msg.id} className={cn("flex w-full animate-in fade-in slide-in-from-bottom-2 duration-300", msg.role === "user" ? "justify-end" : "justify-start")}>
                <div className={cn(
                  "max-w-[85%] rounded-[1.2rem] px-4 py-2.5 shadow-sm text-[13px] leading-tight relative",
                  msg.role === "user" ? "bg-[#d9fdd3] text-slate-900 rounded-tr-none" : "bg-white text-slate-900 rounded-tl-none"
                )}>
                  <div className="whitespace-pre-wrap font-medium">{msg.content}</div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mt-1 flex justify-end items-center gap-1">
                    {msg.timestamp} {msg.role === "user" && <CheckCheck size={12} className="text-blue-500" />}
                  </div>
                  {/* Bubble Tail */}
                  <div className={cn("absolute top-0 w-3 h-3 transition-all",
                    msg.role === "user" ? "-right-1 bg-[#d9fdd3] [clip-path:polygon(100%_0,0_0,0_100%)]" : "-left-1 bg-white [clip-path:polygon(0_0,100%_0,100%_100%)]")}
                  />
                </div>
              </div>
            ))}
            {isTyping && (
              <div className="flex justify-start animate-in fade-in zoom-in-50">
                <div className="bg-white rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex gap-1 items-center">
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.3s]" />
                  <div className="w-1 h-1 bg-slate-300 rounded-full animate-bounce [animation-delay:-0.15s]" />
                  <div className="w-1 h-1 bg-slate-200 rounded-full animate-bounce" />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="bg-white/95 backdrop-blur-md p-3 flex items-center gap-2 z-10 pb-8 border-t border-slate-100">
            <div className="flex-1 bg-slate-50 rounded-2xl flex items-center px-4 py-2 border border-slate-200 shadow-inner group transition-all focus-within:ring-2 focus-within:ring-orange-500/20">
              <Input
                className="border-0 shadow-none focus-visible:ring-0 h-6 px-0 text-[13px] bg-transparent placeholder:text-slate-400 font-medium"
                placeholder="Responder protocolo..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              />
            </div>
            <Button
              size="icon"
              className={cn("rounded-full h-10 w-10 transition-all shadow-md shrink-0",
                input.trim() ? "bg-orange-600 hover:bg-orange-700 text-white rotate-0 scale-100" : "bg-slate-100 text-slate-400 rotate-[-45deg] scale-90")}
              onClick={handleSend}
              disabled={!input.trim()}
            >
              <Send size={16} className={cn(input.trim() ? "ml-0.5" : "")} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}