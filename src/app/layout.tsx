import "@mantine/core/styles.css";
import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";
import Providers from "@/components/Providers";

export const metadata: Metadata = {
  title: "Transfer Vip Spain",
  description: "Plataforma de gestión VTC",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        style={{
          margin: 0,
          fontFamily:
            'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
          background: "#0b1120",
        }}
      >
        <Providers>
          <div
            style={{
              display: "flex",
              minHeight: "100vh",
              background:
                "radial-gradient(circle at top left, rgba(37,99,235,0.10), transparent 28%), radial-gradient(circle at bottom right, rgba(124,58,237,0.10), transparent 24%), #f8fafc",
            }}
          >
            <Sidebar />

            <div
              style={{
                flex: 1,
                minWidth: 0,
                padding: 20,
                boxSizing: "border-box",
              }}
            >
              <div
                style={{
                  minHeight: "calc(100vh - 40px)",
                  borderRadius: 24,
                  background: "rgba(255,255,255,0.75)",
                  backdropFilter: "blur(10px)",
                  WebkitBackdropFilter: "blur(10px)",
                  border: "1px solid rgba(255,255,255,0.5)",
                  boxShadow:
                    "0 10px 30px rgba(15,23,42,0.08), 0 2px 10px rgba(15,23,42,0.04)",
                  overflow: "hidden",
                }}
              >
                <div style={{ padding: 16 }}>{children}</div>
              </div>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}