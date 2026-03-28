"use client";

import { MantineProvider, createTheme } from "@mantine/core";

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
  return <MantineProvider theme={theme}>{children}</MantineProvider>;
}