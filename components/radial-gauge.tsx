"use client";

import React from "react";

interface RadialGaugeProps {
  value: number;
  maxValue?: number;
  size?: number;
  strokeWidth?: number;
  label?: string;
  color?: string;
}

export function RadialGauge({
  value,
  maxValue = 100,
  size = 200,
  strokeWidth = 15,
  label = "RIESGO",
  color: externalColor,
}: RadialGaugeProps) {
  // 1. Sanitización de Inputs (El Blindaje)
  // Si value es undefined, null o NaN, usamos 0.
  const safeValue = Number.isFinite(value) ? value : 0;
  const safeMax = Number.isFinite(maxValue) && maxValue > 0 ? maxValue : 100;

  // 2. Matemáticas del Gauge
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const progress = Math.min(Math.max(safeValue / safeMax, 0), 1); // Clamp entre 0 y 1
  const offset = circumference - progress * circumference;

  // 3. Validación Final de Matemáticas
  // Si por alguna razón offset sigue siendo NaN, forzamos 0 para evitar el crash del DOM
  const safeOffset = Number.isFinite(offset) ? offset : 0;

  // Color dinámico
  const getColor = (v: number) => {
    if (v >= 80) return "#ef4444"; // Red
    if (v >= 50) return "#f97316"; // Orange
    if (v >= 30) return "#eab308"; // Yellow
    return "#10b981"; // Emerald
  };

  const color = externalColor || getColor(safeValue);
  const rotation = progress * 360;

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg
        height={size}
        width={size}
        className="transform -rotate-90"
        viewBox={`0 0 ${size} ${size}`}
      >
        {/* Background Circle */}
        <circle
          stroke="#e2e8f0"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Progress Circle */}
        <circle
          stroke={color}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          style={{
            strokeDashoffset: safeOffset,
            transition: "stroke-dashoffset 1s ease-in-out"
          }}
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>

      {/* Center Text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-3xl font-bold text-slate-700 dark:text-slate-200">
          {safeValue.toFixed(1)}
        </span>
        <span className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">
          {label}
        </span>
      </div>

      {/* Needle (Aguja Decorativa) */}
      <div
        className="absolute top-0 left-0 w-full h-full pointer-events-none"
        style={{ transform: `rotate(${rotation}deg)`, transition: "transform 1s ease-out" }}
      >
        <div
          className="w-1.5 h-4 absolute bg-slate-800 dark:bg-white rounded-full shadow-md"
          style={{
            left: 'calc(50% - 3px)',
            top: strokeWidth - 4 // Ajuste visual para que la aguja "flote" sobre el anillo
          }}
        />
      </div>
    </div>
  );
}