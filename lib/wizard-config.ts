// lib/wizard-config.ts

export const WIZARD_SCENARIOS = {
  // === RUBRO 1: PYME ===
  "Pyme": [
    { 
      id: "pyme-1", 
      title: "Falta de efectivo para sueldos", 
      axis: "Financiero", 
      urgency: "critico", 
      description: "La nómina vence en 3 días y el flujo de caja proyectado es insuficiente.", 
      icon: "DollarSign" 
    },
    { 
      id: "pyme-2", 
      title: "Rotación de personal clave", 
      axis: "Humano", 
      urgency: "critico", 
      description: "Señales de agotamiento detectadas en el Gerente de Ventas.", 
      icon: "Users" 
    },
    { 
      id: "pyme-3", 
      title: "Pérdida de clientes recurrentes", 
      axis: "Reputación", 
      urgency: "medio", 
      description: "Aumento del 15% en cancelaciones de servicios este mes.", 
      icon: "Activity" 
    }
  ],

  // === RUBRO 2: E-COMMERCE ===
  "E-commerce": [
    { 
      id: "ecom-1", 
      title: "Producto estrella sin stock", 
      axis: "Financiero", 
      urgency: "critico", 
      description: "El SKU más vendido se quedará sin inventario en 24 horas.", 
      icon: "ShoppingCart" 
    },
    { 
      id: "ecom-2", 
      title: "Facturación al límite fiscal", 
      axis: "Financiero", 
      urgency: "alto", 
      description: "Próximo a exceder el límite de categoría impositiva.", 
      icon: "TrendingDown" 
    },
    { 
      id: "ecom-3", 
      title: "Opiniones negativas crecientes", 
      axis: "Reputación", 
      urgency: "alto", 
      description: "Pico de reclamos en Mercado Libre por demoras en envíos.", 
      icon: "AlertTriangle" 
    }
  ],

  // === RUBRO 3: CREADORES ===
  "Creadores": [
    { 
      id: "creat-1", 
      title: "Equipo sobrecargado", 
      axis: "Humano", 
      urgency: "critico", 
      description: "El editor principal reporta jornadas de +12hs consecutivas.", 
      icon: "Users" 
    },
    { 
      id: "creat-2", 
      title: "Caída de engagement", 
      axis: "Reputación", 
      urgency: "alto", 
      description: "El alcance de las Stories cayó un 40% en la última semana.", 
      icon: "Activity" 
    },
    { 
      id: "creat-3", 
      title: "Contrato sponsor por vencer", 
      axis: "Financiero", 
      urgency: "medio", 
      description: "Renovación con marca principal pendiente hace 15 días.", 
      icon: "DollarSign" 
    }
  ],

  // === RUBRO 4: STARTUPS ===
  "Startups": [
    { 
      id: "start-1", 
      title: "Proyecto crítico retrasado", 
      axis: "Operativo", 
      urgency: "critico", 
      description: "El lanzamiento del MVP se ha desviado 2 semanas del roadmap.", 
      icon: "Zap" 
    },
    { 
      id: "start-2", 
      title: "Runway agotándose", 
      axis: "Financiero", 
      urgency: "critico", 
      description: "Al ritmo de gasto actual, la caja dura menos de 3 meses.", 
      icon: "DollarSign" 
    },
    { 
      id: "start-3", 
      title: "Feedback negativo en Beta", 
      axis: "Reputación", 
      urgency: "medio", 
      description: "Usuarios reportan bugs críticos en el flujo de onboarding.", 
      icon: "Activity" 
    }
  ]
};