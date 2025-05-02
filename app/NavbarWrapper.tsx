"use client";

import { useAuth } from "../context/AuthContext";
import Navbar from "./navbar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function NavbarWrapper() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check if we're on the home page (root path)
    const isHomePage = pathname === "/";

    if (isHomePage) {
      // Create an effect to watch for the global showNavbar variable
      const checkNavbarVisibility = () => {
        // Use type assertion to fix TypeScript error
        setIsVisible((window as any).showNavbar === true);
      };

      // Initial check
      checkNavbarVisibility();

      // Set up interval to check regularly
      const intervalId = setInterval(checkNavbarVisibility, 100);

      // Clean up on unmount
      return () => clearInterval(intervalId);
    } else {
      // On other pages, always show navbar
      setIsVisible(true);
    }
  }, [pathname]);

  // Don't render anything while authentication is being checked
  if (loading) return null;

  // Don't show navbar during password reset
  if (pathname?.includes("/auth/reset-password")) return null;

  // Only render the navbar if the user is authenticated
  if (!user) return null;

  // Return the navbar with conditional styling for floating appearance
  return (
    <div
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isVisible ? "translate-y-0 opacity-100" : "-translate-y-full opacity-0"
      }`}
    >
      <Navbar />
    </div>
  );
}
