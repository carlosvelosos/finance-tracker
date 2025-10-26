"use client";

import { TableSelectionProvider } from "@/context/TableSelectionContext";

export default function Global2Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <TableSelectionProvider>{children}</TableSelectionProvider>;
}
