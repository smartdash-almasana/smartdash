import React, { useState } from "react";
import {
  Check,
  ArrowRight,
  ShieldCheck,
  MessageSquare,
  Database,
  FileText,
  ArrowLeft,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Tipos de datos para el formulario
type FormData = {
  system: string;
  priority: string;
  channel: string;
  contact: string;
};

const initialFormData: FormData = {
  system: "",
  priority: "",
  channel: "",
  contact: "",
};

const totalSteps = 4;

// Componente principal del Wizard
export default function WizardForm() {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const updateData = (fields: Partial<FormData>) => {
    setFormData((prev) => ({ ...prev, ...fields }));
  };

  const nextStep = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    } else if (step === totalSteps) {
      handleSubmit();
    }
  };

  const prevStep = () => {
    setStep(Math.max(step - 1, 1));
  };

  const progress = (step / totalSteps) * 100;

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulación de envío de datos
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Aquí se enviaría la data a un endpoint real
      console.log("Diagnóstico Finalizado:", formData);
    }, 1500);
  };

  // Datos para las opciones de los pasos
  const step1Options = [
    { id: "ml", label: "Mercado Libre", icon: Database },
    { id: "tango", label: "Tango Gestión", icon: FileText },
    { id: "excel", label: "Excel / CSV", icon: FileText },
    { id: "otros", label: "Otros", icon: FileText },
  ];

  const step2Options = [
    { id: "stock", label: "Evitar quiebres de stock", icon: Database },
    {
      id: "reputacion",
      label: "Proteger mi reputación/medalla",
      icon: ShieldCheck,
    },
    {
      id: "ventas",
      label: "Detectar caídas de ventas al instante",
      icon: FileText,
    },
  ];

  const step3Options = [
    { id: "wa", label: "WhatsApp", icon: MessageSquare },
    { id: "email", label: "Email", icon: FileText },
  ];

  if (isSubmitted) {
    return (
      <div className="min-h-[300px] flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 shadow-sm">
        <ShieldCheck className="w-12 h-12 text-green-500 mb-4" />
        <h2 className="text-3xl font-bold text-[#002D5E] mb-2">
          ¡Diagnóstico Enviado!
        </h2>
        <p className="text-slate-600 max-w-md">
          Gracias por completar el chequeo. En breve, un especialista de
          SmartDash se pondrá en contacto con usted a través de **
          {formData.contact}** para mostrarle cómo blindar su capital.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl w-full mx-auto p-8 rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* Header del Wizard */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <span className="text-[#FF5733] text-sm font-bold tracking-widest uppercase">
            Paso {step}/{totalSteps}
          </span>
          <span className="text-slate-500 text-xs italic">
            Diagnóstico en 60 segundos
          </span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#002D5E] to-blue-400 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Cuerpo del Formulario */}
      <div className="min-h-[300px] flex flex-col justify-center">
        {/* Step 1: Sistema */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <h2 className="text-2xl font-bold text-[#002D5E]">
              ¿Qué sistema utiliza para gestionar su negocio?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {step1Options.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => {
                    updateData({ system: item.label });
                    nextStep();
                  }}
                  className={`h-20 flex flex-col items-center justify-center gap-1 p-4 rounded-xl border transition-all ${
                    formData.system === item.label
                      ? "border-[#FF5733] bg-[#FF5733]/10 text-[#002D5E]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#FF5733] hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-5 h-5 text-[#FF5733]" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 2: Prioridad */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <h2 className="text-2xl font-bold text-[#002D5E]">
              ¿Cuál es su mayor prioridad hoy?
            </h2>
            <div className="grid grid-cols-1 gap-4">
              {step2Options.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => {
                    updateData({ priority: item.label });
                    nextStep();
                  }}
                  className={`h-auto flex items-center justify-start gap-4 p-4 rounded-xl border transition-all ${
                    formData.priority === item.label
                      ? "border-[#FF5733] bg-[#FF5733]/10 text-[#002D5E]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#FF5733] hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-6 h-6 text-[#FF5733] flex-shrink-0" />
                  <span className="font-medium text-base text-left">
                    {item.label}
                  </span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 3: Canal */}
        {step === 3 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <h2 className="text-2xl font-bold text-[#002D5E]">
              ¿Por qué canal prefiere recibir sus alertas?
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {step3Options.map((item) => (
                <Button
                  key={item.id}
                  onClick={() => {
                    updateData({ channel: item.label });
                    nextStep();
                  }}
                  className={`h-20 flex flex-col items-center justify-center gap-1 p-4 rounded-xl border transition-all ${
                    formData.channel === item.label
                      ? "border-[#FF5733] bg-[#FF5733]/10 text-[#002D5E]"
                      : "border-slate-200 bg-slate-50 text-slate-600 hover:border-[#FF5733] hover:bg-slate-100"
                  }`}
                >
                  <item.icon className="w-6 h-6 text-[#FF5733]" />
                  <span className="font-medium text-sm">{item.label}</span>
                </Button>
              ))}
            </div>
          </div>
        )}

        {/* Step 4: Contacto y Finalización */}
        {step === 4 && (
          <div className="animate-in fade-in slide-in-from-right-4 duration-300 space-y-6">
            <div className="inline-flex items-center gap-2 p-3 bg-[#FF5733]/10 rounded-xl mb-4">
              <ShieldCheck className="w-6 h-6 text-[#FF5733]" />
              <h2 className="text-xl font-bold text-[#002D5E]">
                Su diagnóstico está listo
              </h2>
            </div>

            <p className="text-slate-600">
              Ingrese su contacto para recibir una muestra de cómo SmartDash
              protegerá su negocio.
            </p>

            <Input
              type="text"
              placeholder={
                formData.channel === "WhatsApp"
                  ? "Número de WhatsApp (ej: +54 9 11...)"
                  : "Email corporativo"
              }
              value={formData.contact}
              onChange={(e) => updateData({ contact: e.target.value })}
              className="w-full p-4 rounded-xl bg-slate-50 border border-slate-200 text-slate-900 placeholder:text-slate-400 focus:outline-none focus:border-[#FF5733] transition-all"
            />

            <Button
              onClick={nextStep}
              disabled={isSubmitting || formData.contact.length < 5}
              className="w-full h-12 bg-[#FF5733] hover:bg-[#FF5733]/90 text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-opacity"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Finalizando...
                </>
              ) : (
                <>
                  Finalizar Diagnóstico
                  <Check className="w-5 h-5" />
                </>
              )}
            </Button>
          </div>
        )}
      </div>

      {/* Footer del Wizard */}
      {step >= 1 && step <= totalSteps && (
        <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between items-center">
          <p className="text-xs text-slate-500 leading-tight uppercase tracking-wider">
            Privacidad garantizada: No visualizamos ventas, precios ni datos
            sensibles.
          </p>
          {step > 1 && (
            <Button
              onClick={prevStep}
              variant="outline"
              className="flex items-center gap-2 border-slate-300 text-slate-600 hover:text-[#002D5E] hover:bg-slate-100 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" /> Volver
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
