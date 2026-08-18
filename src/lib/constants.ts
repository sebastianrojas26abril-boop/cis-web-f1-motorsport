// Valores base del CIS (Content Intelligence System) de F1 Motorsport.
// Editables desde la sección Estrategia — no se deben hardcodear en el resto de la app.

export const DEFAULT_PILLARS = [
  "Casos de servicio",
  "Taller especializado vs. taller genérico",
  "Detrás de cámara del taller",
];

export const DEFAULT_FUNNEL_STAGES = [
  "Atracción",
  "Autoridad",
  "Deseo",
  "Confianza",
  "Conversión",
];

export const PIPELINE_STAGES = [
  "IDEA",
  "APROBADO",
  "GUION",
  "GRABACIÓN",
  "GRABADO",
  "EDICIÓN",
  "PROGRAMADO",
  "PUBLICADO",
  "PAUSADO",
] as const;

export type PipelineStage = (typeof PIPELINE_STAGES)[number];

export const DEFAULT_SCORE_WEIGHTS = {
  conversion: 55,
  retention: 15,
  attention: 10,
  interaction: 10,
  authority: 10,
};

export const DEFAULT_FUNNEL_DISTRIBUTION: Record<string, number> = {
  "Atracción": 2,
  "Autoridad": 2,
  "Deseo": 1,
  "Confianza": 3,
  "Conversión": 4,
};

export const DEFAULT_OBJECTIVE = "Ventas/Leads + Posicionamiento";
export const DEFAULT_AUDIENCE = "Sin datos";
export const DEFAULT_TONE = "Sin datos";

export const SHOT_STATUSES = ["PENDIENTE", "GRABADA"] as const;
export const SESSION_STATUSES = ["PENDIENTE", "GRABADA"] as const;

export const PIPELINE_STAGE_LABELS: Record<string, string> = {
  IDEA: "Idea",
  APROBADO: "Aprobado",
  GUION: "Guion",
  "GRABACIÓN": "Grabación",
  GRABADO: "Grabado",
  "EDICIÓN": "Edición",
  PROGRAMADO: "Programado",
  PUBLICADO: "Publicado",
  PAUSADO: "Pausado",
};

export const NO_DATA = "Sin datos";
