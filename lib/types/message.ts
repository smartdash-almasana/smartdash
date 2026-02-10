// lib/types/message.ts

export type MessageRole = 'system' | 'user' | 'assistant';

export interface ChatMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: string;
  
  // Metadatos opcionales para enriquecer la UI del chat
  metadata?: {
    impact?: string;        // Ej: "$18,500 USD"
    riskLevel?: string;     // Ej: "critical"
    actionRequired?: boolean;
    actionLink?: string;
  };

  // Estado de lectura
  isRead?: boolean;
}