import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { AlertTriangle, CheckCircle2, AlertCircle, XCircle } from "lucide-react";

interface RiskScoreCardProps {
  score: number;
  level: "low" | "medium" | "high" | "critical";
  accountName?: string;
}

export function RiskScoreCard({ score, level, accountName }: RiskScoreCardProps) {
  const getRiskColor = () => {
    switch (level) {
      case "low":
        return "text-green-600";
      case "medium":
        return "text-yellow-600";
      case "high":
        return "text-orange-600";
      case "critical":
        return "text-red-600";
    }
  };

  const getRiskIcon = () => {
    switch (level) {
      case "low":
        return <CheckCircle2 className="h-8 w-8 text-green-600" />;
      case "medium":
        return <AlertCircle className="h-8 w-8 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-8 w-8 text-orange-600" />;
      case "critical":
        return <XCircle className="h-8 w-8 text-red-600" />;
    }
  };

  const getRiskLabel = () => {
    switch (level) {
      case "low":
        return "Riesgo Bajo";
      case "medium":
        return "Riesgo Medio";
      case "high":
        return "Riesgo Alto";
      case "critical":
        return "Riesgo Crítico";
    }
  };

  const getRiskDescription = () => {
    switch (level) {
      case "low":
        return "Tu cuenta está en buen estado. Continúa con las buenas prácticas.";
      case "medium":
        return "Algunas métricas requieren atención. Revisa las alertas activas.";
      case "high":
        return "Riesgo elevado de penalizaciones. Acción requerida pronto.";
      case "critical":
        return "⚠️ ACCIÓN INMEDIATA REQUERIDA. Alto riesgo de suspensión.";
    }
  };

  const getProgressColor = () => {
    switch (level) {
      case "low":
        return "bg-green-600";
      case "medium":
        return "bg-yellow-600";
      case "high":
        return "bg-orange-600";
      case "critical":
        return "bg-red-600";
    }
  };

  return (
    <Card className="metric-card">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">Risk Score</CardTitle>
            {accountName && (
              <CardDescription className="mt-1">{accountName}</CardDescription>
            )}
          </div>
          {getRiskIcon()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-baseline gap-2">
          <span className={`text-5xl font-bold ${getRiskColor()}`}>{score}</span>
          <span className="text-2xl text-muted-foreground">/100</span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className={`font-semibold ${getRiskColor()}`}>{getRiskLabel()}</span>
            <span className="text-muted-foreground">{score}%</span>
          </div>
          <Progress value={score} className={`h-3 [&>div]:${getProgressColor()}`} />
        </div>

        <p className="text-sm text-muted-foreground">{getRiskDescription()}</p>

        <div className="grid grid-cols-4 gap-2 pt-4 border-t">
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Bajo</div>
            <div className="h-2 bg-green-200 dark:bg-green-900/30 rounded mt-1"></div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Medio</div>
            <div className="h-2 bg-yellow-200 dark:bg-yellow-900/30 rounded mt-1"></div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Alto</div>
            <div className="h-2 bg-orange-200 dark:bg-orange-900/30 rounded mt-1"></div>
          </div>
          <div className="text-center">
            <div className="text-xs text-muted-foreground">Crítico</div>
            <div className="h-2 bg-red-200 dark:bg-red-900/30 rounded mt-1"></div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
