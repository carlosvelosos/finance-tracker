import { AuthProvider } from "../context/AuthContext";
import "./globals.css";
import NavbarWrapper from "./NavbarWrapper"; // We'll create this component
import { Toaster } from "@/components/ui/sonner";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-[#121212] text-white">
        <AuthProvider>
          <NavbarWrapper />{" "}
          {/* Wrapper that conditionally renders the navbar */}
          <Toaster />
          <main>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
