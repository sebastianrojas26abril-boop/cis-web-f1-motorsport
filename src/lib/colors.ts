// Asignación determinística de color para etiquetas dinámicas (pilares, etapas de funnel,
// estados). Los valores conocidos del CIS tienen un color curado; cualquier valor nuevo
// (agregado desde Estrategia/Configuración) recibe un color estable de la paleta via hash.

const PALETTE = [
  { bg: "#dbeafe", fg: "#1e40af" }, // blue
  { bg: "#ede9fe", fg: "#6d28d9" }, // violet
  { bg: "#fef3c7", fg: "#92400e" }, // amber
  { bg: "#dcfce7", fg: "#15803d" }, // green
  { bg: "#fce7f3", fg: "#a21caf" }, // pink
  { bg: "#cffafe", fg: "#0e7490" }, // cyan
  { bg: "#fee2e2", fg: "#b91c1c" }, // red
  { bg: "#e0e7ff", fg: "#4338ca" }, // indigo
  { bg: "#f3f4f6", fg: "#374151" }, // gray
];

const FIXED: Record<string, number> = {
  "Casos de servicio": 0,
  "Taller especializado vs. taller genérico": 1,
  "Detrás de cámara del taller": 2,

  "Atracción": 5,
  "Autoridad": 1,
  "Deseo": 4,
  "Confianza": 3,
  "Conversión": 6,

  IDEA: 8,
  APROBADO: 0,
  GUION: 5,
  "GRABACIÓN": 2,
  GRABADO: 3,
  "EDICIÓN": 1,
  PROGRAMADO: 7,
  PUBLICADO: 3,
  PAUSADO: 8,

  PENDIENTE: 8,
  GRABADA: 3,
};

function hashString(str: string) {
  let h = 0;
  for (let i = 0; i < str.length; i++) {
    h = (h << 5) - h + str.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function colorFor(value: string) {
  const idx = value in FIXED ? FIXED[value] : hashString(value) % PALETTE.length;
  return PALETTE[idx];
}

export function scoreColor(score: number | null | undefined) {
  if (score == null) return { bg: "#f3f4f6", fg: "#6b7280" };
  if (score >= 6) return { bg: "#dcfce7", fg: "#15803d" };
  if (score >= 4) return { bg: "#fef3c7", fg: "#92400e" };
  return { bg: "#fee2e2", fg: "#b91c1c" };
}
