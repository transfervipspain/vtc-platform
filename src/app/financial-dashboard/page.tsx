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
import { prisma } from "@/lib/prisma";
import { getFinancialDashboardData } from "@/lib/finance/dashboard";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: {
    companyId?: string;
    from?: string;
    to?: string;
  };
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

export default async function FinancialDashboardPage({
  searchParams,
}: PageProps) {
  const params = searchParams ?? {};

  let companyId = params.companyId;

  if (!companyId) {
    const firstCompany = await prisma.company.findFirst({
      where: { isActive: true },
      orderBy: { createdAt: "asc" },
      select: { id: true },
    });

    if (!firstCompany) {
      return (
        <Container size="xl" py="md">
          <Card withBorder>
            <Title order={2}>Dashboard financiero</Title>
            <Text c="dimmed" size="sm" mt="sm">
              No hay ninguna empresa activa creada todavía.
            </Text>
          </Card>
        </Container>
      );
    }

    companyId = firstCompany.id;
  }

  const companies = await prisma.company.findMany({
    where: { isActive: true },
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

  return (
    <Container size="xl" py="md">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={2}>Dashboard financiero</Title>
          <Text c="dimmed" size="sm">
            Beneficio real del negocio
          </Text>
        </div>

        <Link href="/dashboard" style={{ textDecoration: "none" }}>
          <Button variant="light">Dashboard general</Button>
        </Link>
      </Group>

      <Card withBorder mb="md" padding="lg" radius="lg">
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
              />
            </div>

            <div>
              <Text size="sm" mb={6}>
                Desde
              </Text>
              <input
                type="date"
                name="from"
                defaultValue={from.toISOString().slice(0, 10)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ced4da",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <Text size="sm" mb={6}>
                Hasta
              </Text>
              <input
                type="date"
                name="to"
                defaultValue={to.toISOString().slice(0, 10)}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  border: "1px solid #ced4da",
                  fontSize: 14,
                }}
              />
            </div>

            <div>
              <Button fullWidth type="submit">
                Actualizar
              </Button>
            </div>
          </div>
        </form>
      </Card>

      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }} spacing="md" mb="md">
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
          title="Margen"
          value={formatPercent(data.profit.marginPct)}
          color={marginColor}
          background={getProfitSurface(data.profit.marginPct)}
          borderColor={getProfitBorder(data.profit.marginPct)}
        />
      </SimpleGrid>

      <SimpleGrid cols={{ base: 1, xl: 2 }} spacing="md" mb="md">
        <Card withBorder padding="lg" radius="lg">
          <Title order={4} mb="md">
            Desglose de ingresos
          </Title>

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

        <Card withBorder padding="lg" radius="lg">
          <Title order={4} mb="md">
            Desglose de costes
          </Title>

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

      <Card withBorder padding="lg" radius="lg">
        <Group justify="space-between" mb="xs">
          <div>
            <Title order={4}>Coste por conductor</Title>
            <Text size="sm" c="dimmed" mt={4}>
              Fijo prorrateado + variable según configuración del conductor.
            </Text>
          </div>

          <Badge
            color={profitColor}
            variant="light"
            size="lg"
          >
            Beneficio {formatCurrency(data.profit.real)}
          </Badge>
        </Group>

        <div style={{ overflowX: "auto", marginTop: 12 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 14,
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
              </tr>
            </thead>
            <tbody>
              {data.breakdown.driverRows.map((d) => (
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
                    <Badge color="blue" variant="light">
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
                    >
                      {formatCurrency(d.totalCost)}
                    </Badge>
                  </td>
                </tr>
              ))}
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
        <Text fw={800} size="xl" c={color}>
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

const thStyle: React.CSSProperties = {
  padding: "12px 10px",
  fontWeight: 700,
  color: "#475569",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 10px",
};