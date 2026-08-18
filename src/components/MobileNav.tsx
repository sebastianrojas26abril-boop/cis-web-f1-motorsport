"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { NAV } from "@/lib/nav";

export function MobileNav() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const current = NAV.find((n) => pathname === n.href || pathname?.startsWith(n.href + "/"));

  return (
    <div className="md:hidden sticky top-0 z-40">
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ background: "var(--sidebar-bg)", borderBottom: "1px solid var(--sidebar-border)" }}
      >
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 rounded-md flex items-center justify-center font-bold text-xs"
            style={{ background: "var(--accent)", color: "white" }}
          >
            F1
          </div>
          <span className="text-sm font-semibold text-white">{current?.label ?? "CIS Web"}</span>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="p-1.5 rounded-md"
          style={{ color: "var(--sidebar-text)" }}
          aria-label="Abrir menú"
        >
          <Menu size={20} />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-50 flex">
          <div className="absolute inset-0 bg-black/50" onClick={() => setOpen(false)} />
          <div
            className="relative w-64 h-full flex flex-col"
            style={{ background: "var(--sidebar-bg)" }}
          >
            <div
              className="flex items-center justify-between px-4 py-4"
              style={{ borderBottom: "1px solid var(--sidebar-border)" }}
            >
              <span className="text-sm font-semibold text-white">CIS Web — F1 Motorsport</span>
              <button onClick={() => setOpen(false)} style={{ color: "var(--sidebar-text)" }}>
                <X size={18} />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto py-3 px-2.5 flex flex-col gap-0.5">
              {NAV.map(({ href, label, icon: Icon }) => {
                const active = pathname === href || pathname?.startsWith(href + "/");
                return (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-md text-[13px] font-medium"
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
          </div>
        </div>
      )}
    </div>
  );
}
