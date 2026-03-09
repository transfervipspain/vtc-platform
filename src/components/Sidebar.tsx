"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  Calendar,
  ClipboardList,
} from "lucide-react";

const links = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/operacion-diaria",
    label: "Operación diaria",
    icon: ClipboardList,
  },
  {
    href: "/privados",
    label: "Viajes privados",
    icon: Car,
  },
  {
    href: "/conductores",
    label: "Conductores",
    icon: Users,
  },
{
  href: "/vehiculos",
  label: "Vehículos",
  icon: Car,
},
  {
    href: "/agenda",
    label: "Agenda diaria",
    icon: Calendar,
  },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <aside
      style={{
        width: 250,
        minHeight: "100vh",
        borderRight: "1px solid #e5e5e5",
        background: "#fafafa",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      {/* Logo / título */}

      <div style={{ marginBottom: 32 }}>
        <div
          style={{
            fontSize: 12,
            color: "#777",
            marginBottom: 6,
            textTransform: "uppercase",
          }}
        >
          Plataforma VTC
        </div>

        <div
          style={{
            fontSize: 22,
            fontWeight: "bold",
          }}
        >
          Transfer Vip Spain
        </div>
      </div>

      {/* navegación */}

      <nav style={{ display: "grid", gap: 6 }}>
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                textDecoration: "none",
                color: active ? "white" : "#222",
                background: active ? "#111" : "transparent",
                fontWeight: 500,
                transition: "0.15s",
              }}
            >
              <Icon size={18} />

              {link.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}