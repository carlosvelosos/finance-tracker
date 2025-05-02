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
    window.showNavbar = showNavbar;

    // Clean up
    return () => {
      window.removeEventListener("scroll", handleScroll);
      delete window.showNavbar;
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
      {/* Hero section - Dark background */}
      <section
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
      </section>

      {/* Upload Transactions Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Upload Transactions
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Import new transactions from your bank statements or credit cards.
              Our system automatically categorizes and organizes your financial
              data for easy tracking and analysis.
            </p>
            <Link
              href="/upload"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-[#12A65C] text-white hover:bg-[#0d8d4e] transition-colors"
            >
              Upload now →
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#12A65C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* View Insights Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              View Insights
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Analyze your spending habits and track your financial progress
              with powerful visualizations and reports. Gain a deeper
              understanding of where your money goes each month.
            </p>
            <Link
              href="/insights"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-[#12A65C] text-white hover:bg-[#0d8d4e] transition-colors"
            >
              See insights →
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#12A65C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 2v4"></path>
                <path d="M12 18v4"></path>
                <path d="M4.93 4.93l2.83 2.83"></path>
                <path d="M16.24 16.24l2.83 2.83"></path>
                <path d="M2 12h4"></path>
                <path d="M18 12h4"></path>
                <path d="M4.93 19.07l2.83-2.83"></path>
                <path d="M16.24 7.76l2.83-2.83"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Family Expenses Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Manage Family Expenses
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Track and split shared expenses with your family members. Easily
              manage household bills, assign responsibilities, and ensure
              everyone contributes their fair share.
            </p>
            <Link
              href="/family"
              className="inline-flex items-center px-6 py-3 text-lg font-medium rounded-lg bg-[#12A65C] text-white hover:bg-[#0d8d4e] transition-colors"
            >
              Family dashboard →
            </Link>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#12A65C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section
        className="w-full py-16 px-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">
            Quick Actions
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="px-6 py-2 text-white bg-[#12A65C] hover:bg-[#0d8d4e] border-none"
            >
              <Link href="/transactions">View All Transactions</Link>
            </Button>
            <Button
              asChild
              className="px-6 py-2 text-white bg-[#12A65C] hover:bg-[#0d8d4e] border-none"
            >
              <Link href="/settings">Account Settings</Link>
            </Button>
            <Button
              asChild
              className="px-6 py-2 text-white bg-[#12A65C] hover:bg-[#0d8d4e] border-none"
            >
              <Link href="/recurrent">Manage Recurring Expenses</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}

// Landing page for non-logged-in users
function UnauthenticatedLandingPage() {
  return (
    <div className="relative flex flex-col items-center">
      {/* Hero section - Dark background */}
      <section
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
      </section>

      {/* Transaction Upload Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Simple Transaction Upload
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Upload your bank statements and credit card transactions with just
              a few clicks. Our system automatically categorizes your expenses,
              making it easy to track where your money goes.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#12A65C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="17 8 12 3 7 8"></polyline>
                <line x1="12" y1="3" x2="12" y2="15"></line>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Powerful Analytics
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Gain insights into your spending habits and track financial
              patterns over time. Our interactive charts and reports help you
              make better financial decisions by visualizing your data.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#12A65C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
                <line x1="2" y1="12" x2="22" y2="12"></line>
                <line x1="12" y1="2" x2="12" y2="22"></line>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* Family Expense Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-1/2">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Family Expense Tracking
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Easily manage shared expenses and split costs between family
              members. Keep track of who paid what and ensure everyone
              contributes their fair share to household finances.
            </p>
          </div>
          <div className="md:w-1/2 flex justify-center">
            <div className="relative w-64 h-64 bg-white rounded-lg shadow-lg flex items-center justify-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#12A65C"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
                <circle cx="9" cy="7" r="4"></circle>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"></path>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
              </svg>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section
        className="w-full py-16 px-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-4 text-gray-800">
            Ready to Get Started?
          </h3>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            Join thousands of users who are taking control of their finances
            with our tools. Sign up today and start your journey to better
            financial health.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="px-8 py-3 text-lg text-white bg-[#12A65C] hover:bg-[#0d8d4e] border-none"
            >
              <Link href="/auth/signup">Create Free Account</Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
