"use client";

import React from "react";
import ThemeProvider from "./ThemeProvider";

export default function ClientThemeWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ThemeProvider>{children}</ThemeProvider>;
}
