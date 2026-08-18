"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV } from "@/lib/nav";

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      className="hidden md:flex md:flex-col w-60 shrink-0 h-screen sticky top-0"
      style={{ background: "var(--sidebar-bg)", borderRight: "1px solid var(--sidebar-border)" }}
    >
      <div className="px-5 py-5" style={{ borderBottom: "1px solid var(--sidebar-border)" }}>
        <div className="flex items-center gap-2">
          <div
            className="w-8 h-8 rounded-md flex items-center justify-center font-bold text-sm"
            style={{ background: "var(--accent)", color: "white" }}
          >
            F1
          </div>
          <div>
            <div className="text-sm font-semibold text-white leading-tight">CIS Web</div>
            <div className="text-[11px] leading-tight" style={{ color: "var(--text-faint)" }}>
              F1 Motorsport
            </div>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
        {NAV.map(({ href, label, icon: Icon }) => {
          const active = pathname === href || pathname?.startsWith(href + "/");
          return (
            <Link
              key={href}
              href={href}
              className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium transition-colors"
              style={{
                background: active ? "var(--accent)" : "transparent",
                color: active ? "white" : "var(--sidebar-text)",
              }}
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </Link>
          );
        })}
      </nav>

      <div
        className="px-5 py-4 text-[11px]"
        style={{ borderTop: "1px solid var(--sidebar-border)", color: "var(--text-faint)" }}
      >
        Centro de operaciones de contenido
      </div>
    </aside>
  );
}
