import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, CheckCircle2, AlertCircle, XCircle, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

interface AlertCardProps {
  id: number;
  type: string;
  severity: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  actionRequired: string;
  aiSuggestion?: string;
  status: "active" | "acknowledged" | "resolved" | "ignored";
  createdAt: Date;
  onAcknowledge?: (id: number) => void;
  onResolve?: (id: number) => void;
  onIgnore?: (id: number) => void;
}

export function AlertCard({
  id,
  severity,
  title,
  description,
  actionRequired,
  aiSuggestion,
  status,
  createdAt,
  onAcknowledge,
  onResolve,
  onIgnore
}: AlertCardProps) {
  const getSeverityIcon = () => {
    switch (severity) {
      case "low":
        return <CheckCircle2 className="h-5 w-5 text-green-600" />;
      case "medium":
        return <AlertCircle className="h-5 w-5 text-yellow-600" />;
      case "high":
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      case "critical":
        return <XCircle className="h-5 w-5 text-red-600" />;
    }
  };

  const getSeverityBadgeClass = () => {
    switch (severity) {
      case "low":
        return "risk-badge-low";
      case "medium":
        return "risk-badge-medium";
      case "high":
        return "risk-badge-high";
      case "critical":
        return "risk-badge-critical";
    }
  };

  const getAlertClass = () => {
    switch (severity) {
      case "low":
        return "alert-low";
      case "medium":
        return "alert-medium";
      case "high":
        return "alert-high";
      case "critical":
        return "alert-critical";
    }
  };

  const getStatusBadge = () => {
    switch (status) {
      case "active":
        return <Badge variant="default">Activa</Badge>;
      case "acknowledged":
        return <Badge variant="secondary">Reconocida</Badge>;
      case "resolved":
        return <Badge variant="outline" className="border-green-500 text-green-700">Resuelta</Badge>;
      case "ignored":
        return <Badge variant="outline" className="border-gray-400 text-gray-600">Ignorada</Badge>;
    }
  };

  return (
    <Card className={`${getAlertClass()} transition-all hover:shadow-md`}>
      <CardHeader>
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            {getSeverityIcon()}
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <CardTitle className="text-lg">{title}</CardTitle>
                <span className={`risk-badge ${getSeverityBadgeClass()}`}>
                  {severity.toUpperCase()}
                </span>
              </div>
              <CardDescription className="flex items-center gap-2 text-xs">
                <Clock className="h-3 w-3" />
                {formatDistanceToNow(new Date(createdAt), { addSuffix: true, locale: es })}
              </CardDescription>
            </div>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-sm text-foreground">{description}</p>
        </div>

        <div className="rounded-md bg-muted p-3">
          <h4 className="text-sm font-semibold mb-1">Acción Requerida:</h4>
          <p className="text-sm text-muted-foreground">{actionRequired}</p>
        </div>

        {aiSuggestion && (
          <div className="rounded-md bg-primary/5 border border-primary/20 p-3">
            <h4 className="text-sm font-semibold mb-1 text-primary">💡 Sugerencia del Asistente IA:</h4>
            <p className="text-sm text-muted-foreground">{aiSuggestion}</p>
          </div>
        )}

        {status === "active" && (
          <div className="flex gap-2 pt-2">
            {onAcknowledge && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAcknowledge(id)}
              >
                Reconocer
              </Button>
            )}
            {onResolve && (
              <Button
                variant="default"
                size="sm"
                onClick={() => onResolve(id)}
              >
                Marcar Resuelta
              </Button>
            )}
            {onIgnore && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onIgnore(id)}
                className="text-muted-foreground"
              >
                Ignorar
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
