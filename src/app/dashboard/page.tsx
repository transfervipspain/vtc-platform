import {
  Container,
  Title,
  Text,
  Card,
  Group,
  Stack,
  Select,
  Button,
  Badge,
  SimpleGrid,
} from "@mantine/core";
import Link from "next/link";
import type { CSSProperties } from "react";
import { prisma } from "@/lib/prisma";
import { getFinancialDashboardData } from "@/lib/finance/dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    companyId?: string;
    from?: string;
    to?: string;
  }>;
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function parseDate(value: string | undefined, fallback: Date) {
  if (!value) return fallback;

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return fallback;

  return parsed;
}

function getProfitColor(value: number) {
  if (value > 0) return "green";
  if (value < 0) return "red";
  return "gray";
}

function getProfitSurface(value: number) {
  if (value > 0) return "#f0fdf4";
  if (value < 0) return "#fef2f2";
  return "#f8f9fa";
}

function getProfitBorder(value: number) {
  if (value > 0) return "#bbf7d0";
  if (value < 0) return "#fecaca";
  return "#dee2e6";
}

function getMarginColor(value: number) {
  if (value > 0) return "green";
  if (value < 0) return "red";
  return "gray";
}

function getCostBadgeColor(value: number) {
  if (value <= 0) return "gray";
  if (value < 300) return "yellow";
  if (value < 1000) return "orange";
  return "red";
}

function getInsights(data: Awaited<ReturnType<typeof getFinancialDashboardData>>) {
  const insights: { text: string; color: string }[] = [];

  if (data.profit.real < 0) {
    insights.push({
      text: "⚠️ Estás en pérdidas en este periodo",
      color: "red",
    });
  } else if (data.profit.marginPct < 10) {
    insights.push({
      text: "⚠️ Margen bajo (menos del 10%)",
      color: "yellow",
    });
  } else {
    insights.push({
      text: "✅ Negocio rentable",
      color: "green",
    });
  }

  if (data.costs.driversTotal > data.income.total * 0.6) {
    insights.push({
      text: "👷 Coste de conductores muy alto",
      color: "orange",
    });
  }

  if (data.costs.energy > data.income.total * 0.25) {
    insights.push({
      text: "⚡ Coste energético elevado",
      color: "yellow",
    });
  }

  const avgPerDriver =
    data.breakdown.driverRows.length > 0
      ? data.profit.real / data.breakdown.driverRows.length
      : 0;

  if (avgPerDriver < 50) {
    insights.push({
      text: "💸 Baja rentabilidad por conductor",
      color: "red",
    });
  }

  return insights;
}

export default async function DashboardPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};

 let companyId = params.companyId;

let company = await prisma.company.findFirst({
  where: {
    isActive: true,
    NOT: { id: "" },
  },
  orderBy: { createdAt: "asc" },
});

if (!company) {
  company = await prisma.company.create({
    data: {
      legalName: "Transfer Vip Spain SL",
      tradeName: "Transfer Vip Spain",
      isActive: true,
    },
  });
}

if (!companyId) {
  companyId = company.id;
}
  const companies = await prisma.company.findMany({
  where: {
    isActive: true,
    NOT: { id: "" },
  },
  select: { id: true, legalName: true, tradeName: true },
  orderBy: { createdAt: "asc" },
});

  const today = new Date();
  const from = parseDate(
    params.from,
    new Date(today.getFullYear(), today.getMonth(), 1)
  );
  const to = parseDate(params.to, today);

  const data = await getFinancialDashboardData({
    companyId,
    from,
    to,
  });

  const profitColor = getProfitColor(data.profit.real);
  const marginColor = getMarginColor(data.profit.marginPct);
  const insights = getInsights(data);

  const avgProfitPerDriver =
    data.breakdown.driverRows.length > 0
      ? data.profit.real / data.breakdown.driverRows.length
      : 0;

  const driverCostPct =
    data.income.total > 0
      ? (data.costs.driversTotal / data.income.total) * 100
      : 0;

 return (
  <Container size="xl" py="lg">
    <Card
      withBorder
      radius="xl"
      p="xl"
      mb="md"
      style={{
        background:
          "linear-gradient(135deg, rgba(37,99,235,0.08), rgba(124,58,237,0.06))",
        borderColor: "#dbe4ff",
      }}
    >
      <Group justify="space-between" align="flex-start">
        <div>
          <Title order={2} mb={6}>
            Dashboard general
          </Title>
          <Text c="dimmed" size="sm">
            Vista financiera principal del negocio
          </Text>
        </div>

        <Link href="/agenda" style={{ textDecoration: "none" }}>
          <Button radius="md" variant="filled">
            Ir a agenda diaria
          </Button>
        </Link>
      </Group>

      <Group mt="md" gap="sm">
        {insights.map((insight, i) => (
          <Badge
            key={i}
            color={insight.color}
            size="lg"
            variant="light"
            radius="sm"
          >
            {insight.text}
          </Badge>
        ))}
      </Group>
    </Card>

    <Card withBorder mb="lg" padding="xl" radius="xl" shadow="xs">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={4}>Filtros</Title>
          <Text size="sm" c="dimmed">
            Selecciona empresa y periodo
          </Text>
        </div>
      </Group>

      <form>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 16,
            alignItems: "end",
          }}
        >
          <div>
            <Select
              name="companyId"
              label="Empresa"
              data={companies.map((c) => ({
                value: c.id,
                label: c.tradeName || c.legalName,
              }))}
              defaultValue={companyId}
              radius="md"
            />
          </div>

          <div>
            <Text size="sm" mb={6} fw={500}>
              Desde
            </Text>
            <input
              type="date"
              name="from"
              defaultValue={from.toISOString().slice(0, 10)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ced4da",
                fontSize: 14,
                boxSizing: "border-box",
                background: "white",
              }}
            />
          </div>

          <div>
            <Text size="sm" mb={6} fw={500}>
              Hasta
            </Text>
            <input
              type="date"
              name="to"
              defaultValue={to.toISOString().slice(0, 10)}
              style={{
                width: "100%",
                padding: "10px 12px",
                borderRadius: 10,
                border: "1px solid #ced4da",
                fontSize: 14,
                boxSizing: "border-box",
                background: "white",
              }}
            />
          </div>

          <div>
            <Button fullWidth type="submit" radius="md">
              Actualizar
            </Button>
          </div>
        </div>
      </form>
    </Card>

    <SimpleGrid cols={{ base: 1, md: 2, xl: 4 }} spacing="md" mb="lg">
      <MetricCard
        title="Ingresos"
        value={formatCurrency(data.income.total)}
        color="blue"
        background="#eff6ff"
        borderColor="#bfdbfe"
      />

      <MetricCard
        title="Coste conductores"
        value={formatCurrency(data.costs.driversTotal)}
        color="orange"
        background="#fff7ed"
        borderColor="#fed7aa"
      />

      <MetricCard
        title="Beneficio"
        value={formatCurrency(data.profit.real)}
        color={profitColor}
        background={getProfitSurface(data.profit.real)}
        borderColor={getProfitBorder(data.profit.real)}
      />

      <MetricCard
        title="Margen"
        value={formatPercent(data.profit.marginPct)}
        color={marginColor}
        background={getProfitSurface(data.profit.marginPct)}
        borderColor={getProfitBorder(data.profit.marginPct)}
      />

      <MetricCard
        title="Energía"
        value={formatCurrency(data.costs.energy)}
        color="yellow"
        background="#fefce8"
        borderColor="#fde68a"
      />

      <MetricCard
        title="Gastos empresa"
        value={formatCurrency(data.costs.companyExpenses)}
        color="grape"
        background="#faf5ff"
        borderColor="#e9d5ff"
      />

      <MetricCard
        title="Beneficio medio / conductor"
        value={formatCurrency(avgProfitPerDriver)}
        color={avgProfitPerDriver > 0 ? "green" : "red"}
        background={getProfitSurface(avgProfitPerDriver)}
        borderColor={getProfitBorder(avgProfitPerDriver)}
      />

      <MetricCard
        title="% coste conductores"
        value={formatPercent(driverCostPct)}
        color={
          driverCostPct < 40
            ? "green"
            : driverCostPct < 60
            ? "yellow"
            : "red"
        }
        background={
          driverCostPct < 40
            ? "#f0fdf4"
            : driverCostPct < 60
            ? "#fefce8"
            : "#fef2f2"
        }
        borderColor={
          driverCostPct < 40
            ? "#bbf7d0"
            : driverCostPct < 60
            ? "#fde68a"
            : "#fecaca"
        }
      />
    </SimpleGrid>

    <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md" mb="lg">
      <Card withBorder padding="xl" radius="xl" shadow="xs">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4}>Desglose de ingresos</Title>
            <Text size="sm" c="dimmed">
              Detalle de entradas del periodo
            </Text>
          </div>
          <Badge color="blue" variant="light" radius="sm">
            Ingresos
          </Badge>
        </Group>

        <Stack gap="sm">
          <Row
            label="Ingresos plataformas"
            value={formatCurrency(data.income.dailyPlatforms)}
            valueColor="#1d4ed8"
          />
          <Row
            label="Privados en operación diaria"
            value={formatCurrency(data.income.dailyPrivateSummary)}
            valueColor="#1d4ed8"
          />
          <Row
            label="Viajes privados completados"
            value={formatCurrency(data.income.privateTripsCompleted)}
            valueColor="#1d4ed8"
          />
          <Row
            label="Total ingresos"
            value={formatCurrency(data.income.total)}
            strong
            valueColor="#1d4ed8"
          />
        </Stack>
      </Card>

      <Card withBorder padding="xl" radius="xl" shadow="xs">
        <Group justify="space-between" mb="md">
          <div>
            <Title order={4}>Desglose de costes</Title>
            <Text size="sm" c="dimmed">
              Estructura de costes del periodo
            </Text>
          </div>
          <Badge color="red" variant="light" radius="sm">
            Costes
          </Badge>
        </Group>

        <Stack gap="sm">
          <Row
            label="Conductores fijo"
            value={formatCurrency(data.costs.driversFixed)}
            valueColor="#c2410c"
          />
          <Row
            label="Conductores variable"
            value={formatCurrency(data.costs.driversVariable)}
            valueColor="#c2410c"
          />
          <Row
            label="Energía"
            value={formatCurrency(data.costs.energy)}
            valueColor="#a16207"
          />
          <Row
            label="Gastos empresa"
            value={formatCurrency(data.costs.companyExpenses)}
            valueColor="#7c3aed"
          />
          <Row
            label="Total costes"
            value={formatCurrency(data.costs.total)}
            strong
            valueColor="#b91c1c"
          />
        </Stack>
      </Card>
    </SimpleGrid>

    <Card withBorder padding="xl" radius="xl" shadow="xs">
      <Group justify="space-between" align="flex-start" mb="md">
        <div>
          <Title order={4}>Rentabilidad por conductor</Title>
          <Text size="sm" c="dimmed" mt={4}>
            Fijo prorrateado + variable según configuración del conductor
          </Text>
        </div>

        <Badge color={profitColor} variant="light" size="lg" radius="sm">
          Beneficio {formatCurrency(data.profit.real)}
        </Badge>
      </Group>

      <div
        style={{
          overflowX: "auto",
          marginTop: 12,
          border: "1px solid #eef2f7",
          borderRadius: 14,
        }}
      >
        <table
          style={{
            width: "100%",
            borderCollapse: "collapse",
            fontSize: 14,
            background: "white",
          }}
        >
          <thead>
            <tr
              style={{
                borderBottom: "1px solid #e9ecef",
                textAlign: "left",
                background: "#f8fafc",
              }}
            >
              <th style={thStyle}>Conductor</th>
              <th style={thStyle}>Ingresos</th>
              <th style={thStyle}>Fijo</th>
              <th style={thStyle}>Variable</th>
              <th style={thStyle}>Total</th>
              <th style={thStyle}>Beneficio</th>
            </tr>
          </thead>
          <tbody>
            {data.breakdown.driverRows.map((d) => {
              const profit = d.generatedIncome - d.totalCost;

              return (
                <tr
                  key={d.driverId}
                  style={{
                    borderBottom: "1px solid #f1f3f5",
                  }}
                >
                  <td style={tdStyle}>
                    <span style={{ fontWeight: 600 }}>{d.driverName}</span>
                  </td>

                  <td style={tdStyle}>
                    <Badge color="blue" variant="light" radius="sm">
                      {formatCurrency(d.generatedIncome)}
                    </Badge>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ color: "#c2410c", fontWeight: 500 }}>
                      {formatCurrency(d.fixedCost)}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <span style={{ color: "#ea580c", fontWeight: 500 }}>
                      {formatCurrency(d.variableCost)}
                    </span>
                  </td>

                  <td style={tdStyle}>
                    <Badge
                      color={getCostBadgeColor(d.totalCost)}
                      variant="light"
                      radius="sm"
                    >
                      {formatCurrency(d.totalCost)}
                    </Badge>
                  </td>

                  <td style={tdStyle}>
                    <Badge
                      color={profit >= 0 ? "green" : "red"}
                      variant="light"
                      radius="sm"
                    >
                      {formatCurrency(profit)}
                    </Badge>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  </Container>
);
}

function MetricCard({
  title,
  value,
  color,
  background,
  borderColor,
}: {
  title: string;
  value: string;
  color: string;
  background: string;
  borderColor: string;
}) {
  return (
    <Card
      withBorder
      padding="lg"
      radius="lg"
      style={{
        background,
        borderColor,
      }}
    >
      <Stack gap={4}>
        <Text size="sm" c="dimmed">
          {title}
        </Text>
        <Text fw={900} size="xl" c={color}>
          {value}
        </Text>
      </Stack>
    </Card>
  );
}

function Row({
  label,
  value,
  strong = false,
  valueColor,
}: {
  label: string;
  value: string;
  strong?: boolean;
  valueColor?: string;
}) {
  return (
    <Group
      justify="space-between"
      style={{
        paddingBottom: 8,
        borderBottom: "1px solid #f1f3f5",
      }}
    >
      <Text fw={strong ? 700 : 400}>{label}</Text>
      <Text fw={strong ? 700 : 500} style={{ color: valueColor }}>
        {value}
      </Text>
    </Group>
  );
}

const thStyle: CSSProperties = {
  padding: "12px 10px",
  fontWeight: 700,
  color: "#475569",
};

const tdStyle: CSSProperties = {
  padding: "12px 10px",
};