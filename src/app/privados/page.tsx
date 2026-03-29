import { prisma } from "@/lib/prisma";
import PrivateTripForm from "./PrivateTripForm";
import AssignDriverSelect from "./AssignDriverSelect";
import TripActionsInline from "./TripActionsInline";
import NewPrivateTripModal from "./NewPrivateTripModal";

export const dynamic = "force-dynamic";

type PageProps = {
  searchParams?: Promise<{
    view?: string;
  }>;
};

function formatDate(date: Date) {
  return new Date(date).toLocaleDateString("es-ES");
}

function formatCurrency(value: number) {
  return `${value.toFixed(2)} €`;
}

function getStatusColor(status: string) {
  switch (status) {
    case "pending":
      return "#6b7280";
    case "assigned":
      return "#2563eb";
    case "in_progress":
      return "#f59e0b";
    case "completed":
      return "#16a34a";
    case "cancelled":
      return "#dc2626";
    default:
      return "#9ca3af";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "pending":
      return "Pendiente";
    case "assigned":
      return "Asignado";
    case "in_progress":
      return "En curso";
    case "completed":
      return "Completado";
    case "cancelled":
      return "Cancelado";
    default:
      return status;
  }
}

function getTimeStatus(serviceDate: Date, serviceTime?: string | null) {
  if (!serviceTime) return "no-time";

  const now = new Date();
  const datePart = new Date(serviceDate).toISOString().split("T")[0];
  const tripDateTime = new Date(`${datePart}T${serviceTime}:00`);
  const diffMinutes = (tripDateTime.getTime() - now.getTime()) / 60000;

  if (diffMinutes < -10) return "late";
  if (diffMinutes <= 30) return "soon";
  return "ok";
}

function getTimeColor(status: string) {
  switch (status) {
    case "late":
      return "#dc2626";
    case "soon":
      return "#f59e0b";
    case "ok":
      return "#16a34a";
    default:
      return "#9ca3af";
  }
}

function getPriority(status: string) {
  switch (status) {
    case "late":
      return 0;
    case "soon":
      return 1;
    case "ok":
      return 2;
    default:
      return 3;
  }
}

function getIncidentText(params: {
  timeStatus: string;
  hasDriver: boolean;
  status: string;
}) {
  const { timeStatus, hasDriver, status } = params;

  if (status === "cancelled") return "Cancelado";
  if (status === "completed") return "Completado";

  if (!hasDriver && timeStatus === "soon") return "Próximo sin conductor";
  if (!hasDriver && timeStatus === "late") return "Retrasado sin conductor";

  if (!hasDriver) return "Sin conductor";
  if (timeStatus === "late") return "Retrasado";
  if (timeStatus === "soon") return "Próximo";
  if (status === "in_progress") return "En curso";
  return "Controlado";
}

function getIncidentBadgeStyle(params: {
  timeStatus: string;
  hasDriver: boolean;
  status: string;
}): React.CSSProperties {
  const { timeStatus, hasDriver, status } = params;

  if (status === "cancelled") {
    return badgeStyle("#fee2e2", "#b91c1c");
  }

  if (status === "completed") {
    return badgeStyle("#dcfce7", "#166534");
  }

  if (!hasDriver && (timeStatus === "soon" || timeStatus === "late")) {
    return badgeStyle("#fee2e2", "#991b1b");
  }

  if (!hasDriver) {
    return badgeStyle("#ede9fe", "#6d28d9");
  }

  if (timeStatus === "late") {
    return badgeStyle("#fee2e2", "#b91c1c");
  }

  if (timeStatus === "soon") {
    return badgeStyle("#fef3c7", "#b45309");
  }

  if (status === "in_progress") {
    return badgeStyle("#dbeafe", "#1d4ed8");
  }

  return badgeStyle("#dcfce7", "#166534");
}

function badgeStyle(background: string, color: string): React.CSSProperties {
  return {
    display: "inline-flex",
    alignItems: "center",
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 12,
    fontWeight: 700,
    background,
    color,
    whiteSpace: "nowrap",
  };
}

export default async function PrivadosPage({ searchParams }: PageProps) {
  const params = (await searchParams) ?? {};
  const view = params.view || "all";

  const company = await prisma.company.findFirst({
    where: {
      isActive: true,
      NOT: { id: "" },
    },
    orderBy: { createdAt: "asc" },
  });

  const trips = await prisma.privateTrip.findMany({
    where: company ? { companyId: company.id } : undefined,
    orderBy: [{ serviceDate: "desc" }, { serviceTime: "asc" }],
    take: 50,
    include: {
      driver: true,
      vehicle: true,
    },
  });

  const drivers = await prisma.driver.findMany({
    where: company ? { companyId: company.id, isActive: true } : undefined,
    orderBy: { fullName: "asc" },
  });

  const today = new Date();
  const startToday = new Date(today);
  startToday.setHours(0, 0, 0, 0);

  const endToday = new Date(today);
  endToday.setHours(23, 59, 59, 999);

  const todayTrips = trips.filter((trip) => {
    const serviceDate = new Date(trip.serviceDate);
    return serviceDate >= startToday && serviceDate <= endToday;
  });

  const todayIncome = todayTrips.reduce((sum, trip) => sum + trip.amount, 0);
  const todayServices = todayTrips.length;
  const todayAvgTicket = todayServices > 0 ? todayIncome / todayServices : 0;

  const sortedTrips = [...trips].sort((a, b) => {
    const statusA = getTimeStatus(a.serviceDate, a.serviceTime);
    const statusB = getTimeStatus(b.serviceDate, b.serviceTime);

    const priorityA = getPriority(statusA);
    const priorityB = getPriority(statusB);

    if (priorityA !== priorityB) {
      return priorityA - priorityB;
    }

    if (a.serviceTime && b.serviceTime) {
      return a.serviceTime.localeCompare(b.serviceTime);
    }

    if (a.serviceTime && !b.serviceTime) return -1;
    if (!a.serviceTime && b.serviceTime) return 1;

    return 0;
  });

  const stats = sortedTrips.reduce(
    (acc, trip) => {
      const timeStatus = getTimeStatus(trip.serviceDate, trip.serviceTime);
      const hasDriver = Boolean(trip.driverId);

      if (
        timeStatus === "late" &&
        trip.status !== "completed" &&
        trip.status !== "cancelled"
      ) {
        acc.late += 1;
      }

      if (
        timeStatus === "soon" &&
        trip.status !== "completed" &&
        trip.status !== "cancelled"
      ) {
        acc.soon += 1;
      }

      if (!hasDriver && trip.status !== "completed" && trip.status !== "cancelled") {
        acc.noDriver += 1;
      }

      if (trip.status === "completed") {
        acc.completed += 1;
      }

      return acc;
    },
    {
      late: 0,
      soon: 0,
      noDriver: 0,
      completed: 0,
    }
  );

  const filteredTrips = sortedTrips.filter((trip) => {
    const timeStatus = getTimeStatus(trip.serviceDate, trip.serviceTime);
    const hasDriver = Boolean(trip.driverId);

    if (view === "urgent") {
      return (
        (timeStatus === "late" || timeStatus === "soon") &&
        trip.status !== "completed" &&
        trip.status !== "cancelled"
      );
    }

    if (view === "no-driver") {
      return !hasDriver && trip.status !== "completed" && trip.status !== "cancelled";
    }

    if (view === "completed") {
      return trip.status === "completed";
    }

    return true;
  });

  return (
    <main
      style={{
        padding: 20,
        maxWidth: 1320,
        margin: "0 auto",
        fontFamily: "Arial, sans-serif",
      }}
    >
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ margin: 0, marginBottom: 8 }}>Viajes privados</h1>
        <p style={{ color: "#6b7280", margin: 0 }}>
          Gestión de servicios privados, prioridades e incidencias.
        </p>
      </div>

      {!company ? (
        <div
          style={{
            border: "1px dashed #d1d5db",
            borderRadius: 14,
            padding: 20,
            background: "#fafafa",
            color: "#6b7280",
          }}
        >
          No hay ninguna empresa activa creada todavía.
        </div>
      ) : (
        <NewPrivateTripModal>
          <PrivateTripForm companyId={company.id} />
        </NewPrivateTripModal>
      )}

      <section style={{ marginTop: 24, marginBottom: 28 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, marginBottom: 6 }}>Resumen de hoy</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            Métricas rápidas de los servicios privados del día.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <IncidentCard
            title="Ingresos hoy"
            valueText={formatCurrency(todayIncome)}
            bg="#eff6ff"
            border="#bfdbfe"
            color="#1d4ed8"
          />
          <IncidentCard
            title="Servicios hoy"
            value={todayServices}
            bg="#f0fdf4"
            border="#bbf7d0"
            color="#166534"
          />
          <IncidentCard
            title="Ticket medio"
            valueText={formatCurrency(todayAvgTicket)}
            bg="#faf5ff"
            border="#e9d5ff"
            color="#7c3aed"
          />
        </div>
      </section>

      <section style={{ marginBottom: 28 }}>
        <div style={{ marginBottom: 14 }}>
          <h2 style={{ margin: 0, marginBottom: 6 }}>Panel de incidencias</h2>
          <p style={{ margin: 0, color: "#6b7280", fontSize: 14 }}>
            Prioriza primero los servicios urgentes y los que están sin asignar.
          </p>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
            gap: 12,
          }}
        >
          <IncidentCard
            title="Retrasados"
            value={stats.late}
            bg="#fef2f2"
            border="#fecaca"
            color="#b91c1c"
          />
          <IncidentCard
            title="Próximos 30 min"
            value={stats.soon}
            bg="#fffbeb"
            border="#fde68a"
            color="#b45309"
          />
          <IncidentCard
            title="Sin conductor"
            value={stats.noDriver}
            bg="#f5f3ff"
            border="#ddd6fe"
            color="#6d28d9"
          />
          <IncidentCard
            title="Completados"
            value={stats.completed}
            bg="#f0fdf4"
            border="#bbf7d0"
            color="#166534"
          />
        </div>
      </section>

      <section>
        <div
          style={{
            display: "flex",
            gap: 10,
            flexWrap: "wrap",
            marginBottom: 18,
          }}
        >
          <FilterLink href="/privados" active={view === "all"}>
            Todos
          </FilterLink>

          <FilterLink href="/privados?view=urgent" active={view === "urgent"}>
            Urgentes
          </FilterLink>

          <FilterLink href="/privados?view=no-driver" active={view === "no-driver"}>
            Sin conductor
          </FilterLink>

          <FilterLink href="/privados?view=completed" active={view === "completed"}>
            Completados
          </FilterLink>
        </div>

        <h2 style={{ margin: 0, marginBottom: 16 }}>Últimos viajes</h2>

        {filteredTrips.length === 0 ? (
          <div
            style={{
              border: "1px dashed #d1d5db",
              borderRadius: 12,
              padding: 24,
              color: "#6b7280",
              background: "#fafafa",
            }}
          >
            No hay viajes para este filtro.
          </div>
        ) : (
          <>
            <style>{`
              @media (max-width: 900px) {
                .private-trips-desktop {
                  display: none !important;
                }
                .private-trips-mobile {
                  display: grid !important;
                }
              }

              @media (min-width: 901px) {
                .private-trips-desktop {
                  display: block !important;
                }
                .private-trips-mobile {
                  display: none !important;
                }
              }
            `}</style>

            <div className="private-trips-desktop" style={{ display: "block" }}>
              <div
                style={{
                  overflowX: "auto",
                  border: "1px solid #e5e7eb",
                  borderRadius: 14,
                  background: "white",
                  boxShadow: "0 4px 14px rgba(0,0,0,0.04)",
                }}
              >
                <table
                  style={{
                    width: "100%",
                    borderCollapse: "collapse",
                    fontSize: 14,
                    minWidth: 1220,
                  }}
                >
                  <thead>
                    <tr
                      style={{
                        background: "#f8fafc",
                        borderBottom: "1px solid #e5e7eb",
                      }}
                    >
                      <th style={th}>Fecha</th>
                      <th style={th}>Hora</th>
                      <th style={th}>Ruta</th>
                      <th style={th}>Importe</th>
                      <th style={th}>Conductor</th>
                      <th style={th}>Vehículo</th>
                      <th style={th}>Estado</th>
                      <th style={th}>Incidencia</th>
                      <th style={th}>Asignar</th>
                      <th style={th}>Acciones</th>
                    </tr>
                  </thead>

                  <tbody>
                    {filteredTrips.map((trip) => {
                      const timeStatus = getTimeStatus(
                        trip.serviceDate,
                        trip.serviceTime
                      );
                      const timeColor = getTimeColor(timeStatus);
                      const hasDriver = Boolean(trip.driverId);

                      const rowBackground =
                        !hasDriver &&
                        (timeStatus === "soon" || timeStatus === "late") &&
                        trip.status !== "completed" &&
                        trip.status !== "cancelled"
                          ? "#fff1f2"
                          : timeStatus === "late" &&
                            trip.status !== "completed" &&
                            trip.status !== "cancelled"
                          ? "#fff7f7"
                          : "transparent";

                      return (
                        <tr
                          key={trip.id}
                          style={{
                            borderBottom: "1px solid #f1f5f9",
                            background: rowBackground,
                          }}
                        >
                          <td style={td}>{formatDate(trip.serviceDate)}</td>

                          <td style={td}>
                            <span
                              style={{
                                display: "inline-flex",
                                alignItems: "center",
                                gap: 6,
                                fontWeight: 700,
                              }}
                            >
                              <span
                                style={{
                                  width: 10,
                                  height: 10,
                                  borderRadius: "50%",
                                  background: timeColor,
                                  boxShadow: `0 0 6px ${timeColor}`,
                                }}
                              />
                              {trip.serviceTime || "--:--"}
                            </span>
                          </td>

                          <td style={td}>
                            <div>
                              {trip.origin || "-"}{" "}
                              <span style={{ color: "#9ca3af" }}>→</span>{" "}
                              {trip.destination || "-"}
                            </div>

                            {trip.stops && (
                              <div style={{ fontSize: 12, color: "#6b7280" }}>
                                Paradas: {trip.stops}
                              </div>
                            )}
                          </td>

                          <td style={{ ...td, fontWeight: 700 }}>
                            {formatCurrency(trip.amount)}
                          </td>

                          <td style={td}>
                            {trip.driver?.fullName ?? (
                              <span style={{ color: "#9ca3af" }}>Sin asignar</span>
                            )}
                          </td>

                          <td style={td}>
                            {trip.vehicle?.plateNumber ?? (
                              <span style={{ color: "#9ca3af" }}>Sin asignar</span>
                            )}
                          </td>

                          <td style={td}>
                            <span
                              style={{
                                padding: "4px 10px",
                                borderRadius: 999,
                                fontSize: 12,
                                fontWeight: 600,
                                color: "white",
                                background: getStatusColor(trip.status),
                              }}
                            >
                              {getStatusLabel(trip.status)}
                            </span>
                          </td>

                          <td style={td}>
                            <span
                              style={getIncidentBadgeStyle({
                                timeStatus,
                                hasDriver,
                                status: trip.status,
                              })}
                            >
                              {getIncidentText({
                                timeStatus,
                                hasDriver,
                                status: trip.status,
                              })}
                            </span>
                          </td>

                          <td style={td}>
                            <AssignDriverSelect tripId={trip.id} drivers={drivers} />
                          </td>

                          <td style={td}>
                            <TripActionsInline tripId={trip.id} status={trip.status} />
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="private-trips-mobile" style={{ display: "none" }}>
              <div
                style={{
                  display: "grid",
                  gap: 12,
                }}
              >
                {filteredTrips.map((trip) => {
                  const timeStatus = getTimeStatus(trip.serviceDate, trip.serviceTime);
                  const timeColor = getTimeColor(timeStatus);
                  const hasDriver = Boolean(trip.driverId);

                  return (
                    <div
                      key={trip.id}
                      style={{
                        border: "1px solid #e5e7eb",
                        borderRadius: 16,
                        background: "white",
                        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
                        padding: 16,
                        display: "grid",
                        gap: 12,
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "flex-start",
                          gap: 12,
                        }}
                      >
                        <div>
                          <div
                            style={{
                              fontSize: 16,
                              fontWeight: 700,
                              color: "#111827",
                              marginBottom: 4,
                            }}
                          >
                            {formatDate(trip.serviceDate)} · {trip.serviceTime || "--:--"}
                          </div>

                          <div style={{ fontSize: 13, color: "#6b7280" }}>
                            {trip.origin || "-"} → {trip.destination || "-"}
                          </div>
                        </div>

                        <span
                          style={{
                            padding: "5px 10px",
                            borderRadius: 999,
                            fontSize: 11,
                            fontWeight: 700,
                            color: "white",
                            background: getStatusColor(trip.status),
                            whiteSpace: "nowrap",
                          }}
                        >
                          {getStatusLabel(trip.status)}
                        </span>
                      </div>

                      <div
                        style={{
                          display: "grid",
                          gridTemplateColumns: "1fr 1fr",
                          gap: 10,
                        }}
                      >
                        <InfoItem label="Importe" value={formatCurrency(trip.amount)} />
                        <InfoItem
                          label="Hora"
                          value={
                            trip.serviceTime ? (
                              <span
                                style={{
                                  display: "inline-flex",
                                  alignItems: "center",
                                  gap: 6,
                                }}
                              >
                                <span
                                  style={{
                                    width: 10,
                                    height: 10,
                                    borderRadius: "50%",
                                    background: timeColor,
                                    boxShadow: `0 0 6px ${timeColor}`,
                                  }}
                                />
                                {trip.serviceTime}
                              </span>
                            ) : (
                              "--:--"
                            )
                          }
                        />
                        <InfoItem
                          label="Conductor"
                          value={trip.driver?.fullName ?? "Sin asignar"}
                        />
                        <InfoItem
                          label="Vehículo"
                          value={trip.vehicle?.plateNumber ?? "Sin asignar"}
                        />
                      </div>

                      {trip.stops ? (
                        <div
                          style={{
                            fontSize: 13,
                            color: "#6b7280",
                            background: "#f8fafc",
                            border: "1px solid #e5e7eb",
                            borderRadius: 12,
                            padding: "10px 12px",
                          }}
                        >
                          <strong style={{ color: "#374151" }}>Paradas:</strong> {trip.stops}
                        </div>
                      ) : null}

                      <div>
                        <span
                          style={getIncidentBadgeStyle({
                            timeStatus,
                            hasDriver,
                            status: trip.status,
                          })}
                        >
                          {getIncidentText({
                            timeStatus,
                            hasDriver,
                            status: trip.status,
                          })}
                        </span>
                      </div>

                      <div style={{ display: "grid", gap: 8 }}>
                        <AssignDriverSelect tripId={trip.id} drivers={drivers} />
                        <TripActionsInline tripId={trip.id} status={trip.status} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}

function IncidentCard({
  title,
  value,
  valueText,
  bg,
  border,
  color,
}: {
  title: string;
  value?: number;
  valueText?: string;
  bg: string;
  border: string;
  color: string;
}) {
  const displayValue = valueText ?? String(value ?? 0);

  return (
    <div
      style={{
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 14,
        padding: 16,
        boxShadow: "0 2px 8px rgba(15,23,42,0.04)",
      }}
    >
      <div style={{ fontSize: 13, color: "#6b7280", marginBottom: 6 }}>
        {title}
      </div>
      <div style={{ fontSize: 28, fontWeight: 800, color }}>{displayValue}</div>
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 14px",
        borderRadius: 999,
        textDecoration: "none",
        fontSize: 14,
        fontWeight: 600,
        background: active ? "#111827" : "#f3f4f6",
        color: active ? "white" : "#374151",
        border: active ? "1px solid #111827" : "1px solid #e5e7eb",
      }}
    >
      {children}
    </a>
  );
}

function InfoItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div
      style={{
        background: "#f8fafc",
        border: "1px solid #e5e7eb",
        borderRadius: 12,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 12, color: "#6b7280", marginBottom: 4 }}>
        {label}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#111827" }}>
        {value}
      </div>
    </div>
  );
}

const th: React.CSSProperties = {
  padding: "12px 14px",
  textAlign: "left",
  fontWeight: 700,
  color: "#475569",
  whiteSpace: "nowrap",
};

const td: React.CSSProperties = {
  padding: "12px 14px",
  verticalAlign: "top",
};