"use client";

import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabaseClient";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { useState, useEffect } from "react";
import { Menu, X } from "lucide-react";
import { DarkNavigationMenuDemo } from "@/components/DarkNavigationMenuDemo";

// Define user types or roles
type NavLink = {
  href: string;
  label: string;
};

export default function Navbar() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);
  const [showLegacyNav, setShowLegacyNav] = useState(false);

  // Handle mouse leave event for the navbar on the home page
  const handleMouseLeave = () => {
    // Only run this logic on the home page (where window.showNavbar exists)
    // Don't hide the navbar if the user is still interacting with it
    // We'll detect this by checking if we're currently scrolled down
    if (typeof window !== "undefined") {
      // Only hide the navbar when we're at the top of the page
      if (window.scrollY <= 50) {
        window.showNavbar = false;
      }
    }
  };

  useEffect(() => {
    // Determine which links to show based on the user's ID or metadata
    if (user) {
      // List of users that should only see limited navigation
      const restrictedUserIds = [
        "0a29c8db-018c-49cb-ac35-7ccf1719be2c",
        "382714ae-4c7c-4a32-9a7d-8b530fbd7ab3",
      ];

      // Check if the current user's ID is in the restricted list
      if (restrictedUserIds.includes(user.id as string)) {
        // Limited navigation for restricted users
        setNavLinks([
          { href: "/family", label: "Family" },
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]);
        // Show legacy nav for restricted users
        setShowLegacyNav(true);
      } else {
        // Use new navigation menu for non-restricted users
        setShowLegacyNav(false);

        // Keep about and contact in legacy navigation
        setNavLinks([
          { href: "/about", label: "About" },
          { href: "/contact", label: "Contact" },
        ]);
      }
    }
  }, [user]);

  // Modify the handleLogout function to handle the AuthSessionMissingError
  const handleLogout = async (e: React.MouseEvent | React.TouchEvent) => {
    // Prevent default behavior and stop propagation
    e.preventDefault();
    e.stopPropagation();

    try {
      // Sign out from Supabase with enhanced error handling
      console.log("Attempting to log out...");

      // Try to sign out
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error("Error logging out:", error);

        // If it's an auth session missing error, treat it as successful logout
        if (error.message.includes("Auth session missing")) {
          console.log("No active session to end - already logged out");
          performCleanupAndRedirect();
          return;
        }

        // For other errors, show an alert
        window.alert("Failed to log out. Please try again.");
      } else {
        console.log("Logged out successfully");
        performCleanupAndRedirect();
      }
    } catch (error) {
      console.error("Unexpected error during logout:", error);
      window.alert("Something went wrong during logout. Please try again.");
    }
  };

  // Helper function to clean up and redirect
  const performCleanupAndRedirect = () => {
    // Clear any localStorage items related to auth
    try {
      localStorage.removeItem("supabase.auth.token");
      localStorage.removeItem("supabase.auth.expires_at");
      localStorage.removeItem("supabase.auth.refresh_token");

      // Clear any other app state
      sessionStorage.clear();
    } catch (e) {
      console.error("Error clearing storage:", e);
    }

    // Redirect to login page
    window.location.href = "/auth/login";
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu
  };

  return (
    <nav
      className="text-white p-4 flex justify-between items-center relative shadow-none backdrop-filter-none w-full max-w-[1400px] mx-auto"
      onMouseLeave={handleMouseLeave}
    >
      {/* Logo or App Name */}
      <div className="text-lg font-bold relative">
        <Link
          href="/"
          className="text-green-400 block px-4 py-2 hover:bg-black hover:bg-opacity-20 hover:border hover:border-gray-400 rounded-3xl transition duration-300 ease-in-out relative z-10"
        >
          <span>Finance Tracker</span>
        </Link>
        {/* Background text "FINCKER" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[2vw] font-extrabold text-[#1a1a1a] opacity-15 select-none whitespace-nowrap">
            FINCKER
          </span>
        </div>
      </div>

      {/* Dark Navigation Menu for desktop, non-restricted users */}
      {!showLegacyNav && (
        <div className="hidden lg:flex lg:items-center lg:justify-center flex-1 px-4">
          <DarkNavigationMenuDemo />
        </div>
      )}

      {/* Hamburger Menu for Small Screens */}
      <div className="lg:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-white focus:outline-none"
        >
          {isMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* Navigation Links */}
      <div
        className={`${
          isMenuOpen ? "block" : "hidden"
        } absolute top-full left-0 w-full bg-[#121212] lg:bg-transparent lg:static lg:flex lg:items-center lg:gap-4 lg:w-auto z-50`}
      >
        {/* Legacy Navigation Links (for mobile or restricted users) */}
        {showLegacyNav && (
          <div
            className="flex flex-col gap-y-2 px-4 py-2 lg:flex-row lg:gap-4 lg:p-0 lg:rounded-md lg:border-t lg:border-gray-700 lg:border-b lg:border-gray-700"
            style={{ backgroundColor: "#121212" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-black hover:bg-opacity-30 hover:text-green-400 transition-colors duration-200 hover:font-bold rounded-3xl"
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* Mobile Navigation Menu (only shown on mobile when menu is open) */}
        {!showLegacyNav && isMenuOpen && (
          <div className="lg:hidden w-full py-4">
            <DarkNavigationMenuDemo />
          </div>
        )}

        {/* About & Contact Links (for non-restricted users) */}
        {!showLegacyNav && (
          <div
            className="flex flex-col gap-y-2 px-4 py-2 lg:flex-row lg:gap-4 lg:p-0 lg:rounded-md"
            style={{ backgroundColor: "#121212" }}
          >
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-4 py-2 text-sm text-gray-200 hover:bg-black hover:bg-opacity-30 hover:text-green-400 transition-colors duration-200 hover:font-bold rounded-3xl"
                onClick={handleLinkClick}
              >
                {link.label}
              </Link>
            ))}
          </div>
        )}

        {/* User Authentication */}
        <div className="flex flex-col gap-y-2 px-4 py-2 border-t border-gray-700 lg:border-none lg:flex-row lg:gap-4 lg:p-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#1E1E1E] border border-gray-700 hover:bg-[#2A2A2A] text-gray-200 lg:ml-auto"
                >
                  <div className="w-8 h-8 rounded-full bg-green-900 flex items-center justify-center text-green-300 font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[150px] truncate">{user.email}</span>
                  <svg
                    width="12"
                    height="12"
                    viewBox="0 0 12 12"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M2.5 4.5L6 8L9.5 4.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="center"
                sideOffset={10}
                className="w-[calc(100vw-40px)] max-w-[300px] lg:max-w-[300px] lg:w-56 p-1.5 bg-[#1E1E1E] border border-gray-700 border-b-4 border-b-green-700 shadow-lg rounded-lg mt-1 mx-auto"
              >
                {/* Rest of your dropdown content updated for dark theme */}
                <div className="px-3 py-2 mb-1 border-b border-gray-700">
                  <p className="text-sm font-medium text-gray-200">
                    {user.email}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 truncate">
                    Account ID: {user.id?.substring(0, 8)}...
                  </p>
                </div>

                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer rounded-md hover:bg-[#2A2A2A]">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22"
                      stroke="#9CA3AF"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-medium text-gray-300">Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  onClick={handleLogout}
                  onTouchEnd={handleLogout} // Add touch event handler
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer rounded-md hover:bg-red-900"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54"
                      stroke="#F87171"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M15 12H3.62"
                      stroke="#F87171"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M5.85 8.6499L2.5 11.9999L5.85 15.3499"
                      stroke="#F87171"
                      strokeWidth="1.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <span className="font-medium text-red-400">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-900 border border-green-700 text-green-300 hover:bg-green-800 transition-colors duration-200 font-medium lg:ml-auto"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8.90002 16.44C9.21002 20.04 11.06 21.51 15.11 21.51H15.24C19.71 21.51 21.5 19.72 21.5 15.25V8.73C21.5 4.26 19.71 2.47 15.24 2.47H15.11C11.09 2.47 9.24002 3.92 8.91002 7.46"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M15 12H3.62"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M5.85 8.6499L2.5 11.9999L5.85 15.3499"
                  stroke="#10B981"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
