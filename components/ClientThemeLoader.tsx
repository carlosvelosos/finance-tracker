"use client";

import dynamic from "next/dynamic";
import React from "react";

const ClientThemeWrapperNoSSR = dynamic(() => import("./ClientThemeWrapper"), {
  ssr: false,
});

export default function ClientThemeLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientThemeWrapperNoSSR>{children}</ClientThemeWrapperNoSSR>;
}
