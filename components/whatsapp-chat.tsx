"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { createClient } from "@supabase/supabase-js";
import { cn } from "@/lib/utils";
import { Send, CheckCheck, MoreVertical, Search, Paperclip, Smile, Mic } from "lucide-react";

// Configuración de Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

interface WhatsappChatProps {
  capturaId: string;
  className?: string;
}

interface Mensaje {
  id: string;
  texto: string;
  sender: "bot" | "user";
  timestamp: string;
  status?: "sent" | "delivered" | "read";
}

export const WhatsappChat = ({ capturaId, className }: WhatsappChatProps) => {
  const [data, setData] = useState<any>(null);
  const [mensajes, setMensajes] = useState<Mensaje[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const [botStatus, setBotStatus] = useState("en línea");
  const [inputValue, setInputValue] = useState("");
  const [step, setStep] = useState(0); 
  const scrollRef = useRef<HTMLDivElement>(null);

  const getCurrentTime = () => new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // 1. Carga de datos desde la Fuente de la Verdad (Vista API) 
  useEffect(() => {
    const loadData = async () => {
      if (!capturaId) return;
      const { data: res, error } = await supabase
        .from("vista_dashboard_riesgos_api")
        .select("*")
        .eq("captura_id", capturaId)
        .maybeSingle();

      if (error) {
        console.error("Error cargando captura:", error);
        return;
      }
      if (res) setData(res);
    };
    loadData();
  }, [capturaId]);

  // 2. Auto-scroll al final del chat
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [mensajes, isTyping]);

  // 3. Orquestador de Mensajes del Bot (Dosis 1-6)
  const addBotMessage = useCallback((text: string, delay = 1500, nextAction?: () => void) => {
    setIsTyping(true);
    setBotStatus("escribiendo...");
    
    setTimeout(() => {
      setIsTyping(false);
      setBotStatus("en línea");
      setMensajes(prev => [...prev, {
        id: crypto.randomUUID(),
        texto: text,
        sender: "bot",
        timestamp: getCurrentTime()
      }]);
      if (nextAction) nextAction();
    }, delay);
  }, []);

  // Iniciar flujo automáticamente al cargar datos
  useEffect(() => {
    if (data && step === 0) {
      setStep(1);
      addBotMessage(`🤖 SmartDash IA ha detectado señales críticas para ${data.nombre_cliente}.`, 1000, () => {
        setTimeout(() => {
          const signalText = `📊 Señales detectadas:\n🔥 ${data.signals?.detalle || 'Runway crítico'}\n${data.signals?.indicadores?.map((i: string) => `• ${i}`).join("\n")}\n\nOpciones:\n1 → Continuar\n0 → Salir`;
          addBotMessage(signalText, 1500);
        }, 800);
      });
    }
  }, [data, step, addBotMessage]);

  // 4. Manejo de Interacción del Usuario (Simulación de demo)
  const handleAction = () => {
    if (isTyping || step >= 6) return;

    let responseText = "";
    if (step === 1) responseText = "1 (Continuar)";
    else if (step === 2) responseText = "1 (Ver Mitigación)";
    else if (step === 3) responseText = "1 (Ejecutar Plan)";
    else if (step === 5) responseText = "1 (Sí, generar informe IA)";

    setInputValue(responseText);

    setTimeout(() => {
      setMensajes(prev => [...prev, {
        id: crypto.randomUUID(),
        texto: responseText,
        sender: "user",
        timestamp: getCurrentTime(),
        status: "read"
      }]);
      setInputValue("");

      // Lógica de transición de pasos
      if (step === 1) {
        setStep(2);
        setTimeout(() => {
          const riesgoText = `⚠️ Escenario de Riesgo:\n\n${data.escenario}\nNivel: ${data.nivel_riesgo}\nScore: ${data.puntaje_global}\nMonto en riesgo: ${data.monto_en_riesgo}\n\nOpciones:\n1 → Ver Mitigación\n0 → Salir`;
          addBotMessage(riesgoText, 1500);
        }, 800);
      } else if (step === 2) {
        setStep(3);
        setTimeout(() => {
          addBotMessage(`✅ Plan de Mitigación Sugerido:\n${data.recomendacion}\n\nOpciones:\n1 → Ejecutar plan\n0 → Posponer`, 1800);
        }, 800);
      } else if (step === 3) {
        setStep(5);
        setTimeout(() => {
          addBotMessage(`🚀 Plan ejecutado para ${data.nombre_cliente}.`, 1000, () => {
            setTimeout(() => {
              addBotMessage(`📩 Reporte enviado al email de contacto.\n\n💡 ¿Quieres que la IA genere un informe profundo con más herramientas de mitigación?\n\n1 → Sí, generar\n0 → No`, 1500);
            }, 800);
          });
        }, 800);
      } else if (step === 5) {
        setStep(6);
        setTimeout(() => {
          addBotMessage(`📝 Generando informe avanzado para ${data.nombre_cliente}...`, 1000, () => {
            setIsTyping(true);
            setBotStatus("procesando...");
            setTimeout(() => {
              setIsTyping(false);
              setBotStatus("en línea");
              addBotMessage("✅ Informe listo. Revisa tu panel principal.", 0);
            }, 2500);
          });
        }, 800);
      }
    }, 400);
  };

  if (!data) return <div className="p-8 text-center text-slate-400 animate-pulse">Sincronizando con Fuente de la Verdad...</div>;

  return (
    <div className={cn("flex flex-col h-full w-full bg-[#efeae2] rounded-[18px] overflow-hidden shadow-2xl border border-gray-300 font-sans relative", className)}>
      
      {/* Header WhatsApp */}
      <div className="bg-[#008069] px-4 py-3 flex items-center justify-between shadow-md z-20 shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-white p-0.5 overflow-hidden">
            <img src={data.logo_url} className="w-full h-full object-contain rounded-full" alt="Logo" />
          </div>
          <div className="flex flex-col text-white">
            <span className="font-semibold text-[15px] leading-tight">SmartDash IA</span>
            <span className="text-[11px] opacity-90 leading-tight">{botStatus}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-white/90">
          <Search size={18} />
          <MoreVertical size={18} />
        </div>
      </div>

      {/* Cuerpo del Chat */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 space-y-3 relative"
        style={{ backgroundImage: "url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')", backgroundBlendMode: "overlay" }}
      >
        {mensajes.map((m) => (
          <div key={m.id} className={cn("flex w-full", m.sender === "user" ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] px-3 py-1.5 rounded-lg shadow-sm text-[14.2px] leading-[19px] relative",
              m.sender === "user" ? "bg-[#dcf8c6] rounded-tr-none" : "bg-white rounded-tl-none"
            )}>
              <span className={cn("absolute top-0 w-0 h-0 border-[6px] border-transparent", m.sender === "user" ? "-right-1.5 border-t-[#dcf8c6] border-l-[#dcf8c6]" : "-left-1.5 border-t-white border-r-white")}></span>
              <p className="whitespace-pre-wrap text-slate-800">{m.texto}</p>
              <div className="flex items-center justify-end gap-1 mt-1 -mb-1 opacity-50">
                <span className="text-[10px] uppercase">{m.timestamp}</span>
                {m.sender === "user" && <CheckCheck size={14} className="text-blue-500" />}
              </div>
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-white px-4 py-3 rounded-lg rounded-tl-none shadow-sm flex items-center gap-1">
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
              <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
            </div>
          </div>
        )}
      </div>

      {/* Footer / Input */}
      <div className="bg-[#f0f2f5] px-3 py-2 flex items-center gap-2 border-t border-gray-300 z-20 shrink-0">
        <Smile size={24} className="text-gray-500 cursor-pointer" />
        <Paperclip size={22} className="text-gray-500 cursor-pointer" />
        <div 
          onClick={handleAction}
          className="flex-1 bg-white rounded-lg px-4 py-2 text-sm shadow-sm flex items-center h-10 cursor-pointer"
        >
          {inputValue ? <span className="text-slate-900">{inputValue}</span> : <span className="text-gray-400">Escribe un mensaje...</span>}
        </div>
        <button 
          onClick={handleAction}
          disabled={step >= 6 || isTyping}
          className={cn("p-2.5 rounded-full shadow-sm", (inputValue || step < 6) ? "bg-[#008069] text-white" : "text-gray-500")}
        >
          {(inputValue || step < 6) ? <Send size={20} className="ml-0.5" /> : <Mic size={22} />}
        </button>
      </div>
    </div>
  );
};