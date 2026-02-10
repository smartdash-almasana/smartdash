// components/risk-badge.tsx
// Badge visual para nivel de riesgo usando tokens centralizados

import { Badge } from "@/components/ui/badge";
import { getRiskToken } from "@/lib/ui/risk-tokens";
import { cn } from "@/lib/utils";

interface RiskBadgeProps {
    nivel: string | undefined | null;
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    className?: string;
}

/**
 * Badge visual que muestra el nivel de riesgo con colores y estilo consistente.
 * Usa RISK_TOKENS como fuente de verdad visual.
 */
export function RiskBadge({ nivel, size = 'md', showIcon = true, className }: RiskBadgeProps) {
    const token = getRiskToken(nivel);

    const sizeClasses = {
        sm: 'px-2 py-0.5 text-[9px]',
        md: 'px-3 py-1 text-[10px]',
        lg: 'px-4 py-2 text-xs',
    };

    return (
        <Badge
            variant="outline"
            className={cn(
                "font-black uppercase tracking-widest",
                token.bg,
                token.text,
                token.border,
                sizeClasses[size],
                className
            )}
        >
            {showIcon && <span className="mr-1">{token.icon}</span>}
            {token.label}
        </Badge>
    );
}
