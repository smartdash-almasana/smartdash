"use client"

import React, { useTransition } from 'react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

// 1. Importación estricta desde el dominio (FV)
import { Message } from '@/lib/domain/risk'
import { getSeverityUI } from '@/lib/ui/risk-ui.mapper'

// 2. Importación del componente de UI (con fallback interno si fuera necesario)
import { ScrollArea } from '@/components/ui/scroll-area'

interface WhatsAppChatProps {
  messages: Message[]
  onMarkAsRead: (id: string) => void
}

export function WhatsAppChat({ messages, onMarkAsRead }: WhatsAppChatProps) {
  const [isPending, startTransition] = useTransition()

  return (
    <div className="flex flex-col h-full bg-background/50 border-t md:border-t-0 md:border-l border-border">
      <ScrollArea className="flex-1 p-4 h-[500px]">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center text-center p-8 text-muted-foreground text-sm italic">
              No hay notificaciones activas en este momento.
            </div>
          ) : (
            messages.map((msg) => {
              const ui = getSeverityUI(msg.priority);
              const isUnread = msg.status !== 'read';

              return (
                <div
                  key={msg.id}
                  onClick={() => isUnread && !isPending && startTransition(() => onMarkAsRead(msg.id))}
                  className={`flex flex-col space-y-1 group transition-all ${
                    isUnread ? 'cursor-pointer' : 'cursor-default opacity-80'
                  } ${msg.type === 'outgoing' ? 'items-end' : 'items-start'}`}
                >
                  {/* Metadata y Prioridad */}
                  <div className="flex items-center gap-2 px-1">
                    {isUnread && (
                      <span className={`h-1.5 w-1.5 rounded-full animate-pulse ${ui.dot}`} />
                    )}
                    <span className={`text-[10px] font-bold uppercase tracking-tighter ${ui.color}`}>
                      {ui.label}
                    </span>
                  </div>

                  {/* Burbuja de Mensaje */}
                  <div
                    className={`max-w-[85%] rounded-2xl px-4 py-2 text-sm shadow-sm border transition-all ${
                      msg.type === 'outgoing'
                        ? 'bg-primary text-primary-foreground border-primary'
                        : isUnread 
                          ? 'bg-card border-primary/30 ring-1 ring-primary/10 shadow-md' 
                          : 'bg-muted/30 text-muted-foreground border-transparent'
                    }`}
                  >
                    <p className="leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                    
                    <div className={`mt-1 flex items-center justify-end gap-1 text-[10px] ${
                      msg.type === 'outgoing' ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                      {format(new Date(msg.timestamp), 'HH:mm', { locale: es })}
                      {msg.status === 'read' && (
                        <span className="text-blue-500 ml-1 font-bold">✓✓</span>
                      )}
                    </div>
                  </div>
                </div>
              )
            })
          )}
        </div>
      </ScrollArea>

      {/* Footer Placeholder para IA (Fase 3.5) */}
      <div className="border-t border-border p-3 bg-muted/30">
        <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors cursor-not-allowed">
          <span className="flex-1 italic truncate">
            {isPending ? 'Sincronizando lectura...' : 'Analizando contexto para respuesta AI...'}
          </span>
        </div>
      </div>
    </div>
  )
}