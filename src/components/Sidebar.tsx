"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/operacion-diaria", label: "Operación diaria" },
  { href: "/privados", label: "Viajes privados" },
  { href: "/conductores", label: "Conductores" },
  { href: "/agenda", label: "Agenda diaria" },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        borderRight: "1px solid #e5e5e5",
        background: "#fafafa",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 12, color: "#777", marginBottom: 6 }}>
          Plataforma VTC
        </div>
        <div style={{ fontSize: 22, fontWeight: "bold" }}>
          Transfer Vip Spain
        </div>
      </div>

      <nav style={{ display: "grid", gap: 8 }}>
        {links.map((link) => {
          const active = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "block",
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? "white" : "#222",
                background: active ? "#111" : "transparent",
                fontWeight: active ? "bold" : 500,
              }}
            >
              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}