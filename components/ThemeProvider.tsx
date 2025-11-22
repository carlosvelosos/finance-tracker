"use client";

import { ThemeProvider as NextThemeProvider } from "next-themes";
import React from "react";

export default function ThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <NextThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem={true}
      enableColorScheme={false}
      storageKey="email-client-theme"
    >
      {children}
    </NextThemeProvider>
  );
}
