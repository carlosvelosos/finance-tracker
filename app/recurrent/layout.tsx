import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Recurrent Expenses",
};

export default function RecurrentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
