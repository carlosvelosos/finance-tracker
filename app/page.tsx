"use client";

import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState, useEffect, useCallback } from "react";

export default function LandingPage() {
  const { user, loading } = useAuth();
  const [showNavbar, setShowNavbar] = useState(false);

  // Create a stable callback function for scroll handling
  const handleScroll = useCallback(() => {
    // Show navbar when scrolled down (more than 50px), hide when at top
    if (window.scrollY <= 50) {
      setShowNavbar(false);
    } else {
      setShowNavbar(true);
    }
  }, []);

  useEffect(() => {
    // Add scroll event listener
    window.addEventListener("scroll", handleScroll);

    // Set initial state based on current scroll position
    handleScroll();

    // Expose navbar state to global window for the NavbarWrapper to access
    (window as any).showNavbar = showNavbar;

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
      delete (window as any).showNavbar;
    };
  }, [handleScroll, showNavbar]);

  // Show loading state while authentication status is being determined
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  // Return different UI based on authentication status
  return (
    <div className="relative min-h-screen">
      {user ? <AuthenticatedLandingPage /> : <UnauthenticatedLandingPage />}

      {/* Footer - common to both versions */}
      <footer className="w-full text-center py-4 bg-black bg-opacity-50 text-white text-sm">
        © {new Date().getFullYear()} Finance Tracker. All rights reserved.
      </footer>
    </div>
  );
}

// Landing page for logged-in users
function AuthenticatedLandingPage() {
  return (
    <div className="relative flex flex-col items-center">
      {/* First section - Dark background */}
      <div
        className="w-full flex flex-col items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: "#121212" }}
      >
        <h1
          className="text-3xl md:text-6xl font-bold mb-4"
          style={{ color: "#303030" }}
        >
          Welcome back to Finance Tracker
        </h1>
        <p className="text-xl font-bold" style={{ color: "#303030" }}>
          {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Second section - Light background */}
      <div
        className="w-full min-h-screen py-30 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card
              className="p-6 hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e5e7eb",
                borderWidth: "1px",
              }}
            >
              <h2 className="text-xl font-bold mb-3 text-[#12A65C]">
                Upload Transactions
              </h2>
              <p className="text-gray-600 mb-4">
                Import new transactions from your bank statements or credit
                cards.
              </p>
              <Link
                href="/upload"
                className="inline-block text-[#12A65C] font-medium hover:underline"
              >
                Upload now →
              </Link>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e5e7eb",
                borderWidth: "1px",
              }}
            >
              <h2 className="text-xl font-bold mb-3 text-[#12A65C]">
                View Insights
              </h2>
              <p className="text-gray-600 mb-4">
                Analyze your spending habits and track your financial progress.
              </p>
              <Link
                href="/insights"
                className="inline-block text-[#12A65C] font-medium hover:underline"
              >
                See insights →
              </Link>
            </Card>

            <Card
              className="p-6 hover:shadow-lg transition-shadow"
              style={{
                backgroundColor: "#ffffff",
                borderColor: "#e5e7eb",
                borderWidth: "1px",
              }}
            >
              <h2 className="text-xl font-bold mb-3 text-[#12A65C]">
                Manage Family Expenses
              </h2>
              <p className="text-gray-600 mb-4">
                Track and split shared expenses with your family members.
              </p>
              <Link
                href="/family"
                className="inline-block text-[#12A65C] font-medium hover:underline"
              >
                Family dashboard →
              </Link>
            </Card>
          </div>

          <div className="pb-12">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">
              Quick Actions
            </h3>
            <div className="flex flex-wrap gap-4">
              <Button
                asChild
                variant="outline"
                className="text-[#555555] border-gray-300 hover:bg-gray-100"
              >
                <Link href="/transactions">View All Transactions</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-[#555555] border-gray-300 hover:bg-gray-100"
              >
                <Link href="/settings">Account Settings</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Landing page for non-logged-in users
function UnauthenticatedLandingPage() {
  return (
    <div className="relative flex flex-col items-center">
      {/* First section - Dark background */}
      <div
        className="w-full flex flex-col items-center justify-center min-h-screen px-4"
        style={{ backgroundColor: "#121212" }}
      >
        <div className="text-center transform -translate-y-10 md:-translate-y-16">
          <h1
            className="text-2xl md:text-6xl font-bold"
            style={{ color: "#303030" }}
          >
            Welcome to Finance Tracker
          </h1>
          <p
            className="text-sm md:text-lg drop-shadow-lg mb-6 max-w-2xl mx-auto"
            style={{ color: "#303030" }}
          >
            Track your finances effortlessly. Manage your transactions, analyze
            your spending, and stay on top of your budget.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8">
            <Button
              asChild
              className="bg-[#12A65C] hover:bg-[#0d8d4e] text-white"
            >
              <Link href="/auth/signup">Get Started</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/auth/login">Log In</Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Second section - Light background */}
      <div className="w-full py-16 px-4" style={{ backgroundColor: "#f3f4f6" }}>
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-[#12A65C]">
                Simple Transaction Upload
              </h3>
              <p className="text-gray-600">
                Upload your bank statements and credit card transactions with
                just a few clicks.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-[#12A65C]">
                Powerful Analytics
              </h3>
              <p className="text-gray-600">
                Gain insights into your spending habits and track financial
                patterns over time.
              </p>
            </div>
            <div className="p-6 bg-white rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold mb-2 text-[#12A65C]">
                Family Expense Tracking
              </h3>
              <p className="text-gray-600">
                Easily manage shared expenses and split costs between family
                members.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
