import { MessageCircle, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface CTAIAProps {
  title?: string;
  description?: string;
  onClick?: () => void;
  className?: string;
}

export const CTAIA = ({ 
  title = "💡 SmartDash IA Premium", 
  description = "Descubre insights avanzados y planes de acción personalizados generados por nuestra IA entrenada.", 
  onClick, 
  className 
}: CTAIAProps) => {
  return (
    <div className={cn(
      "bg-gradient-to-br from-yellow-400 to-yellow-600 text-white rounded-3xl shadow-2xl p-6 max-w-md mx-auto",
      className
    )}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-12 h-12 bg-white/25 rounded-xl flex items-center justify-center flex-shrink-0">
          <MessageCircle className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-black mb-1">{title}</h3>
          <p className="text-sm text-yellow-50 leading-relaxed">{description}</p>
        </div>
      </div>
      <button 
        onClick={onClick} 
        className="w-full bg-white hover:bg-yellow-50 text-yellow-700 font-bold py-3 px-6 rounded-xl shadow-lg transition-transform duration-200 hover:scale-[1.02] flex items-center justify-center gap-2"
      >
        <span>Ver Inteligencia Premium</span>
        <ArrowRight className="w-5 h-5" />
      </button>
    </div>
  );
};
