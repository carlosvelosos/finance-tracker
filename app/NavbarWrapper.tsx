"use client";

import { useAuth } from "../context/AuthContext";
import Navbar from "./navbar";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function NavbarWrapper() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [isVisible, setIsVisible] = useState(true);

  // Check if current path is the landing page (root path)
  const isLandingPage = pathname === "/";

  useEffect(() => {
    if (isLandingPage) {
      // Only apply scroll-based visibility on landing page
      const checkNavbarVisibility = () => {
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
  }, [pathname, isLandingPage]);

  // Don't render anything while authentication is being checked
  if (loading) return null;

  // Don't show navbar during password reset
  if (pathname?.includes("/auth/reset-password")) return null;

  // Only render the navbar if the user is authenticated
  if (!user) return null;

  if (isLandingPage) {
    // Floating navbar with animation for landing page
    return (
      <div
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isVisible
            ? "translate-y-0 opacity-100"
            : "-translate-y-full opacity-0"
        }`}
      >
        <Navbar />
      </div>
    );
  } else {
    // Standard static navbar for all other pages
    return <Navbar />;
  }
}
