import type { Metadata } from "next";
import Sidebar from "@/components/Sidebar";

export const metadata: Metadata = {
  title: "Transfer Vip Spain",
  description: "Plataforma de gestión VTC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body style={{ margin: 0, fontFamily: "Arial, sans-serif" }}>
        <div style={{ display: "flex", minHeight: "100vh" }}>
          <Sidebar />

          <div style={{ flex: 1, background: "#fff" }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}