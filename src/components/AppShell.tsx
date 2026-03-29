"use client";

import { useEffect, useState } from "react";
import { Menu } from "lucide-react";
import Sidebar from "@/components/Sidebar";

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isMobile, setIsMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 900;
      setIsMobile(mobile);
      if (!mobile) {
        setMobileMenuOpen(false);
      }
    }

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 28%), radial-gradient(circle at bottom right, rgba(124,58,237,0.10), transparent 24%), #f8fafc",
      }}
    >
      {isMobile ? (
        <>
          {mobileMenuOpen && (
            <div
              onClick={() => setMobileMenuOpen(false)}
              style={{
                position: "fixed",
                inset: 0,
                background: "rgba(15, 23, 42, 0.45)",
                zIndex: 40,
              }}
            />
          )}

          <div
            style={{
              position: "fixed",
              top: 12,
              left: 12,
              zIndex: 60,
            }}
          >
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Abrir menú"
              style={{
                width: 44,
                height: 44,
                borderRadius: 12,
                border: "1px solid #dbe4ff",
                background: "white",
                color: "#111827",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 10px 25px rgba(15,23,42,0.12)",
                cursor: "pointer",
              }}
            >
              <Menu size={20} />
            </button>
          </div>

          <div
  style={{
    position: "fixed",
    top: 0,
    left: 0,
    bottom: 0,
    width: 270,
    zIndex: 50,
    transform: mobileMenuOpen ? "translateX(0)" : "translateX(-100%)",
    transition: "transform 0.22s ease",
    overflowY: "auto",
    WebkitOverflowScrolling: "touch",
  }}
>
            <Sidebar
              mobileOpen={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </>
      ) : (
        <Sidebar />
      )}

      <div
        style={{
          flex: 1,
          minWidth: 0,
          padding: isMobile ? "64px 12px 12px" : 20,
          boxSizing: "border-box",
        }}
      >
        <div
          style={{
            minHeight: isMobile ? "calc(100vh - 76px)" : "calc(100vh - 40px)",
            borderRadius: isMobile ? 18 : 24,
            background: "rgba(255,255,255,0.75)",
            backdropFilter: "blur(10px)",
            WebkitBackdropFilter: "blur(10px)",
            border: "1px solid rgba(255,255,255,0.5)",
            boxShadow:
              "0 10px 30px rgba(15,23,42,0.08), 0 2px 10px rgba(15,23,42,0.04)",
            overflow: "hidden",
          }}
        >
          <div style={{ padding: isMobile ? 12 : 16 }}>{children}</div>
        </div>
      </div>
    </div>
  );
}