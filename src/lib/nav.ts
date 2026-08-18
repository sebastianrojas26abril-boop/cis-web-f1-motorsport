import {
  LayoutDashboard,
  FileStack,
  KanbanSquare,
  Calendar,
  Clapperboard,
  ScrollText,
  TrendingUp,
  Lightbulb,
  Compass,
  Settings,
  type LucideIcon,
} from "lucide-react";

export type NavItem = { href: string; label: string; icon: LucideIcon };

export const NAV: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/contenido", label: "Contenido", icon: FileStack },
  { href: "/pipeline", label: "Pipeline", icon: KanbanSquare },
  { href: "/calendario", label: "Calendario", icon: Calendar },
  { href: "/produccion", label: "Producción", icon: Clapperboard },
  { href: "/guiones", label: "Guiones", icon: ScrollText },
  { href: "/rendimiento", label: "Rendimiento", icon: TrendingUp },
  { href: "/aprendizajes", label: "Aprendizajes", icon: Lightbulb },
  { href: "/estrategia", label: "Estrategia", icon: Compass },
  { href: "/configuracion", label: "Configuración", icon: Settings },
];
