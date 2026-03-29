import "@mantine/core/styles.css";
import type { Metadata } from "next";
import Providers from "@/components/Providers";
import AppShell from "@/components/AppShell";

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
          <AppShell>{children}</AppShell>
        </Providers>
      </body>
    </html>
  );
}