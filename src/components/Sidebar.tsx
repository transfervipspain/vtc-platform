"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Car,
  Users,
  Calendar,
  ClipboardList,
  DollarSign,
  FileBarChart,
  ReceiptText,
  X,
} from "lucide-react";

type Props = {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
};

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
  {
    href: "/gastos",
    label: "Gastos",
    icon: DollarSign,
  },
  {
    href: "/liquidaciones",
    label: "Liquidaciones",
    icon: ReceiptText,
  },
  {
    href: "/informes",
    label: "Informes",
    icon: FileBarChart,
  },
];

export default function Sidebar({ mobileOpen = false, onCloseMobile }: Props) {
  const pathname = usePathname();

  return (
<aside
  style={{
    width: 270,
    minWidth: 270,
    minHeight: "100%",
    height: "100vh",
    background: "linear-gradient(180deg, #0f172a 0%, #111827 100%)",
    color: "white",
    padding: 20,
    boxSizing: "border-box",
    borderRight: "1px solid rgba(255,255,255,0.06)",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
paddingBottom: 24,
  }}
>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 24,
        }}
      >
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: 11,
              color: "rgba(255,255,255,0.55)",
              marginBottom: 8,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              fontWeight: 700,
            }}
          >
            Plataforma VTC
          </div>

          <div
            style={{
              background: "rgba(255,255,255,0.04)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 16,
              padding: 16,
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: 12,
                background: "linear-gradient(135deg, #2563eb, #7c3aed)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 16,
                marginBottom: 12,
                boxShadow: "0 8px 18px rgba(37,99,235,0.35)",
              }}
            >
              TV
            </div>

            <div
              style={{
                fontSize: 20,
                fontWeight: 800,
                lineHeight: 1.2,
                marginBottom: 6,
              }}
            >
              Transfer Vip Spain
            </div>

            <div
              style={{
                fontSize: 13,
                color: "rgba(255,255,255,0.65)",
                lineHeight: 1.4,
              }}
            >
              Gestión integral de flota, servicios e informes.
            </div>
          </div>
        </div>

        {mobileOpen && onCloseMobile ? (
          <button
            type="button"
            onClick={onCloseMobile}
            aria-label="Cerrar menú"
            style={{
              marginLeft: 12,
              width: 40,
              height: 40,
              borderRadius: 10,
              border: "1px solid rgba(255,255,255,0.12)",
              background: "rgba(255,255,255,0.06)",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              flexShrink: 0,
            }}
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div
        style={{
          fontSize: 11,
          color: "rgba(255,255,255,0.45)",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
          fontWeight: 700,
          marginBottom: 10,
          paddingLeft: 8,
        }}
      >
        Navegación
      </div>

      <nav style={{ display: "grid", gap: 8 }}>
        {links.map((link) => {
          const active = pathname === link.href;
          const Icon = link.icon;

          return (
            <Link
              key={link.href}
              href={link.href}
              onClick={onCloseMobile}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                padding: "12px 14px",
                borderRadius: 14,
                textDecoration: "none",
                color: active ? "#ffffff" : "rgba(255,255,255,0.78)",
                background: active
                  ? "linear-gradient(135deg, #2563eb, #1d4ed8)"
                  : "rgba(255,255,255,0.03)",
                border: active
                  ? "1px solid rgba(255,255,255,0.14)"
                  : "1px solid rgba(255,255,255,0.04)",
                fontWeight: active ? 700 : 500,
                boxShadow: active
                  ? "0 10px 20px rgba(37,99,235,0.25)"
                  : "none",
                transition: "all 0.18s ease",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: 10,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active
                    ? "rgba(255,255,255,0.16)"
                    : "rgba(255,255,255,0.06)",
                  flexShrink: 0,
                }}
              >
                <Icon size={18} />
              </div>

              <span>{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          marginTop: 20,
          padding: 14,
          borderRadius: 14,
          background: "rgba(255,255,255,0.04)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            marginBottom: 6,
            color: "rgba(255,255,255,0.92)",
          }}
        >
          Centro de control
        </div>

        <div
          style={{
            fontSize: 12,
            lineHeight: 1.5,
            color: "rgba(255,255,255,0.58)",
          }}
        >
          Operativa, gastos, liquidaciones e informes en un solo sitio.
        </div>
      </div>
    </aside>
  );
}