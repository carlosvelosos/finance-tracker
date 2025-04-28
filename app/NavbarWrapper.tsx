"use client";

import { useAuth } from "../context/AuthContext";
import Navbar from "./navbar";
import { usePathname } from "next/navigation";

export default function NavbarWrapper() {
  const { user, loading } = useAuth();
  const pathname = usePathname();

  // Don't render anything while authentication is being checked
  if (loading) return null;

  // Don't show navbar during password reset
  if (pathname?.includes("/auth/reset-password")) return null;

  // Only render the navbar if the user is authenticated
  return user ? <Navbar /> : null;
}
