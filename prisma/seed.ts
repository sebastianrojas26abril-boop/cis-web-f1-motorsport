// Seed inicial con los datos reales del CIS (Content Intelligence System) de F1 Motorsport.
// Fuente: instrucciones del usuario + verificado contra D:\CLAUDE\files\content-calendar.md
// y content-strategy.md (no se inventa ningún dato).

import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import path from "node:path";
import {
  DEFAULT_PILLARS,
  DEFAULT_FUNNEL_STAGES,
  DEFAULT_SCORE_WEIGHTS,
  DEFAULT_FUNNEL_DISTRIBUTION,
  DEFAULT_OBJECTIVE,
  DEFAULT_AUDIENCE,
  DEFAULT_TONE,
} from "../src/lib/constants";

const adapter = new PrismaBetterSqlite3({
  url: path.join(process.cwd(), "prisma", "dev.db"),
});
const prisma = new PrismaClient({ adapter });

const PILLAR_CASOS = "Casos de servicio";
const PILLAR_TALLER = "Taller especializado vs. taller genérico";
const PILLAR_DETRAS = "Detrás de cámara del taller";

const contents = [
  {
    number: 1,
    title: "Así llegó este Audi Q5 a F1 Motorsport",
    pillar: PILLAR_CASOS,
    funnelStage: "Atracción",
    opportunityScore: 3.65,
    status: "GRABADO",
    notes:
      "Aparece Bastian. Caso real Audi Q5 (mantenimiento preventivo 5,000km, comprado de 2da mano). Cierre ajustado: sin \"agenda tu cita\" → \"Así cuidamos cada auto que entra a F1 Motorsport\".",
  },
  {
    number: 2,
    title: "Diagnóstico con scanner, en vivo",
    pillar: PILLAR_DETRAS,
    funnelStage: "Autoridad",
    opportunityScore: 4.75,
    persona: "David",
    notes:
      "No depende de caso puntual — cualquier auto en diagnóstico regular. Mecanismo: diagnóstico narrado sin guion.",
  },
  {
    number: 3,
    title: "Lo que revisamos que otros no cotizan",
    pillar: PILLAR_TALLER,
    funnelStage: "Confianza",
    opportunityScore: 6.5,
    caso: "Audi Q5",
    notes:
      "Quién aparece: a definir. Usa el caso Audi Q5 — mostrar el checklist real de lo revisado más allá de lo pedido (aceite de caja).",
  },
  {
    number: 4,
    title: "No arreglamos solo lo que pediste",
    pillar: PILLAR_CASOS,
    funnelStage: "Conversión",
    opportunityScore: 7.25,
    caso: "Audi Q5",
    notes:
      "Quién aparece: a definir. Cliente pidió aceite de caja, el scanner determinó que también hacía falta frenos y suspensión. Sin footage del momento exacto del hallazgo — narrar con voz en off sobre footage general.",
  },
  {
    number: 5,
    title: "3 señales de auxilio",
    pillar: PILLAR_TALLER,
    funnelStage: "Atracción",
    opportunityScore: 4.65,
    notes: "Quién aparece: a definir. No depende de caso — contenido educativo puro.",
  },
  {
    number: 6,
    title: "Esto se siente cuando...",
    pillar: PILLAR_DETRAS,
    funnelStage: "Deseo",
    opportunityScore: 2.25,
    notes:
      "Pieza sensorial, sin rostro necesariamente — planos del auto, sonido del motor, detalle. Sin CTA directo.",
  },
  {
    number: 7,
    title: "Qué hacemos si algo no sale bien",
    pillar: PILLAR_DETRAS,
    funnelStage: "Confianza",
    opportunityScore: 5.85,
    persona: "David",
    notes:
      "Peso del dueño, compromiso de la casa. No depende de caso puntual — explicación del proceso/política de F1.",
  },
  {
    number: 8,
    title: "18 años, un solo enfoque",
    pillar: PILLAR_TALLER,
    funnelStage: "Conversión",
    opportunityScore: 6.55,
    persona: "Bastian o David",
    notes: "No depende de caso. Alternativas de título disponibles si se quiere ajustar.",
  },
  {
    number: 9,
    title: "El equipo que usamos",
    pillar: PILLAR_TALLER,
    funnelStage: "Autoridad",
    opportunityScore: 4.85,
    persona: "David",
    notes: "No depende de caso — tomas del scanner en uso.",
  },
  {
    number: 10,
    title: "Así se ve lo que se hizo, línea por línea",
    pillar: PILLAR_CASOS,
    funnelStage: "Confianza",
    opportunityScore: 6.15,
    caso: "Audi Q5",
    notes:
      "Quién aparece: a definir. Walkthrough de la hoja de servicio real, sin montos ocultos. Reemplaza idea original de repuestos (sin material disponible).",
  },
  {
    number: 11,
    title: "El diagnóstico ya viene incluido",
    pillar: PILLAR_DETRAS,
    funnelStage: "Conversión",
    opportunityScore: 6.25,
    notes:
      "No depende de caso. Solo el dato confirmado de offer-intelligence.md (diagnóstico sin costo aparte) — sin prometer \"sin compromiso\".",
  },
  {
    number: 12,
    title: "Se encendió el check engine",
    pillar: PILLAR_TALLER,
    funnelStage: "Conversión",
    opportunityScore: 6.35,
    notes: "No depende de caso. Sin afirmaciones técnicas por marca no verificadas.",
  },
];

async function main() {
  console.log("Seeding StrategyConfig...");
  await prisma.strategyConfig.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      pillars: JSON.stringify(DEFAULT_PILLARS),
      funnelStages: JSON.stringify(DEFAULT_FUNNEL_STAGES),
      objective: DEFAULT_OBJECTIVE,
      audience: DEFAULT_AUDIENCE,
      tone: DEFAULT_TONE,
      scoreWeights: JSON.stringify(DEFAULT_SCORE_WEIGHTS),
      funnelDistribution: JSON.stringify(DEFAULT_FUNNEL_DISTRIBUTION),
    },
  });

  console.log("Seeding 12 contenidos iniciales...");
  const createdByNumber = new Map<number, number>();
  for (const c of contents) {
    const created = await prisma.contentPiece.upsert({
      where: { number: c.number },
      update: {},
      create: {
        number: c.number,
        title: c.title,
        pillar: c.pillar,
        funnelStage: c.funnelStage,
        opportunityScore: c.opportunityScore,
        status: c.status ?? "APROBADO",
        persona: c.persona,
        caso: c.caso,
        notes: c.notes,
      },
    });
    createdByNumber.set(c.number, created.id);
  }

  console.log("Seeding Grupo Audi Q5 (contenidos #3, #4, #10)...");
  const group = await prisma.productionGroup.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      name: "Grupo Audi Q5",
      sharedMaterial: "Audi Q5, hoja de servicio, scanner, suspensión, frenos",
    },
  });

  const id3 = createdByNumber.get(3)!;
  const id4 = createdByNumber.get(4)!;
  const id10 = createdByNumber.get(10)!;

  await prisma.contentPiece.update({ where: { id: id3 }, data: { groupId: group.id } });
  await prisma.contentPiece.update({ where: { id: id4 }, data: { groupId: group.id } });
  await prisma.contentPiece.update({ where: { id: id10 }, data: { groupId: group.id } });

  console.log("Seeding tomas compartidas del Grupo Audi Q5...");
  const shotDefs = [
    { description: "Hoja completa", contentIds: [id3, id10] },
    { description: "Líquido de frenos", contentIds: [id3, id4, id10] },
    { description: "Suspensión", contentIds: [id3, id4, id10] },
  ];

  for (const s of shotDefs) {
    const existing = await prisma.shot.findFirst({
      where: { description: s.description, contentPieces: { some: { groupId: group.id } } },
    });
    if (existing) continue;
    await prisma.shot.create({
      data: {
        description: s.description,
        contentPieces: { connect: s.contentIds.map((id) => ({ id })) },
      },
    });
  }

  console.log("Seed completo.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
