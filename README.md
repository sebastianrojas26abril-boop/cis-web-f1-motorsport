# CIS Web — F1 Motorsport

Centro de operaciones de contenido para F1 Motorsport: gestiona todo el flujo
idea → estrategia → guion → grabación → edición → calendario → publicación →
resultados → aprendizajes desde una interfaz visual.

Construido con Next.js 16, Prisma 7 y Postgres (Neon). Completamente separado
de la Knowledge Base original del CIS — la app solo la usó como fuente inicial
de datos, nunca la modifica.

## Desarrollo local

```bash
npm install
npx prisma migrate dev   # aplica el schema a la base de datos
npx tsx prisma/seed.ts   # carga los 12 contenidos iniciales + grupo Audi Q5
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

Las variables de entorno (`DATABASE_URL`, `DATABASE_URL_UNPOOLED`) viven en
`.env.local`, gestionadas por la integración de Neon en Vercel — corre
`vercel env pull` para sincronizarlas en una máquina nueva.

## Secciones

Dashboard · Contenido · Pipeline · Calendario · Producción · Guiones ·
Rendimiento · Aprendizajes · Estrategia · Configuración.

## Despliegue

Conectado a Vercel con auto-deploy: cada push a `master` despliega
automáticamente a producción.
