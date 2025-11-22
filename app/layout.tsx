import { AuthProvider } from "../context/AuthContext";
import "./globals.css";
import NavbarWrapper from "./NavbarWrapper"; // We'll create this component
import { Toaster } from "@/components/ui/sonner";
import ThemeProvider from "@/components/ThemeProvider";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "FINKER | Finance Tracker",
    template: " FINKER | %s", // %s will be replaced by page titles
  },
  description: "Track expenses, manage budgets, and gain financial insights",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <AuthProvider>
            <NavbarWrapper />{" "}
            {/* Wrapper that conditionally renders the navbar */}
            <Toaster />
            <main>{children}</main>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
