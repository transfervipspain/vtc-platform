"use client";

import "@mantine/core/styles.css";
import "@mantine/dates/styles.css";
import "dayjs/locale/es";

import { MantineProvider, createTheme } from "@mantine/core";
import { DatesProvider } from "@mantine/dates";

const theme = createTheme({
  primaryColor: "blue",
  defaultRadius: "md",
  fontFamily:
    'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  headings: {
    fontFamily:
      'Inter, Arial, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
  },
  components: {
    Button: {
      defaultProps: {
        radius: "md",
        color: "blue",
      },
    },
    Card: {
      defaultProps: {
        radius: "xl",
        withBorder: true,
      },
    },
    Badge: {
      defaultProps: {
        radius: "sm",
      },
    },
    Select: {
      defaultProps: {
        radius: "md",
      },
    },
  },
});

export default function Providers({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <MantineProvider theme={theme}>
      <DatesProvider
        settings={{
          locale: "es",
          firstDayOfWeek: 1,
          weekendDays: [0, 6],
        }}
      >
        {children}
      </DatesProvider>
    </MantineProvider>
  );
}