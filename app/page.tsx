"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";

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
        ©{" "}
        {new Date().toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        })}{" "}
        Finance Tracker. All rights reserved.
      </footer>
    </div>
  );
}

// Landing page for logged-in users
function AuthenticatedLandingPage() {
  const [currentTextIndex, setCurrentTextIndex] = useState(0);
  const textOptions = [
    "Finance Tracker",
    "Budget Master",
    "Expense Manager",
    "Money Dashboard",
    "Savings Planner",
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTextIndex((prevIndex) => (prevIndex + 1) % textOptions.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex flex-col items-center">
      {/* Hero section - Dark background */}
      <section
        className="w-full flex flex-col items-center justify-center min-h-screen px-4 relative overflow-hidden"
        style={{ backgroundColor: "#121212" }}
      >
        {/* Background text "FINCKER" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden">
          <span className="text-[20vw] font-extrabold text-[#1a1a1a] opacity-25 select-none">
            FINCKER
          </span>
        </div>

        <h1
          className="text-3xl md:text-6xl font-bold flex flex-col items-center z-10"
          style={{ color: "#303030" }}
        >
          <span>Welcome back to</span>
          <span className="text-4xl md:text-9xl mt-10 mb-10 text-[#12A65C] animate-pulse transition-all duration-500">
            {textOptions[currentTextIndex]}
          </span>
        </h1>
        <p className="text-xl font-bold z-10" style={{ color: "#303030" }}>
          {new Date().toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
          <span className="mx-3">|</span>
          {new Date().toLocaleTimeString(undefined, {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </section>

      {/* Upload Transactions Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/5">
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
          <div className="md:w-3/5 flex justify-center">
            <div className="relative w-full h-auto bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-105">
              <img
                src="/upload.png"
                alt="Upload Transactions Screenshot"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* View Insights Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-2/5">
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
          <div className="md:w-3/5 flex justify-center">
            <div className="relative w-full h-auto bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-105">
              <img
                src="/handelsbanken-charts.png"
                alt="Financial Insights Dashboard"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Family Expenses Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/5">
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
          <div className="md:w-3/5 flex justify-center">
            <div className="relative w-full h-auto bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-105">
              <img
                src="/family.png"
                alt="Family Expenses Management"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section
        className="w-full py-16 px-4"
        style={{ backgroundColor: "#0d8d4e" }}
      >
        <div className="max-w-4xl mx-auto text-center">
          <h3 className="text-2xl font-semibold mb-6 text-white">
            Quick Actions
          </h3>
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              asChild
              className="px-6 py-2 text-[#0d8d4e] bg-white hover:bg-gray-100 border-none relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href="/transactions" className="flex items-center">
                <span className="relative z-10">View All Transactions</span>
                <span className="absolute inset-0 bg-[#0d8d4e] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d8d4e] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
              </Link>
            </Button>
            <Button
              asChild
              className="px-6 py-2 text-[#0d8d4e] bg-white hover:bg-gray-100 border-none relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href="/settings" className="flex items-center">
                <span className="relative z-10">Account Settings</span>
                <span className="absolute inset-0 bg-[#0d8d4e] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d8d4e] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
              </Link>
            </Button>
            <Button
              asChild
              className="px-6 py-2 text-[#0d8d4e] bg-white hover:bg-gray-100 border-none relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href="/recurrent" className="flex items-center">
                <span className="relative z-10">Manage Recurring Expenses</span>
                <span className="absolute inset-0 bg-[#0d8d4e] opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0d8d4e] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
              </Link>
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
              className="bg-[#12A65C] hover:bg-[#0d8d4e] text-white relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href="/auth/signup" className="flex items-center">
                <span className="relative z-10">Get Started</span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              className="relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href="/auth/login" className="flex items-center">
                <span className="relative z-10">Log In</span>
                <span className="absolute inset-0 bg-[#12A65C] opacity-0 group-hover:opacity-5 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-[#12A65C] transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Transaction Upload Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/5">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Simple Transaction Upload
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Upload your bank statements and credit card transactions with just
              a few clicks. Our system automatically categorizes your expenses,
              making it easy to track where your money goes.
            </p>
          </div>
          <div className="md:w-3/5 flex justify-center">
            <div className="relative w-full h-auto bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-105">
              <img
                src="/upload.png"
                alt="Upload Transactions Screenshot"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#ffffff" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row-reverse items-center gap-8">
          <div className="md:w-2/5">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Powerful Analytics
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Gain insights into your spending habits and track financial
              patterns over time. Our interactive charts and reports help you
              make better financial decisions by visualizing your data.
            </p>
          </div>
          <div className="md:w-3/5 flex justify-center">
            <div className="relative w-full h-auto bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-105">
              <img
                src="/handelsbanken-charts.png"
                alt="Financial Analytics Dashboard"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "500px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Family Expense Section */}
      <section
        className="w-full py-20 px-4"
        style={{ backgroundColor: "#f3f4f6" }}
      >
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8">
          <div className="md:w-2/5">
            <h2 className="text-3xl font-bold mb-4 text-[#12A65C]">
              Family Expense Tracking
            </h2>
            <p className="text-gray-600 mb-6 text-lg">
              Easily manage shared expenses and split costs between family
              members. Keep track of who paid what and ensure everyone
              contributes their fair share to household finances.
            </p>
          </div>
          <div className="md:w-3/5 flex justify-center">
            <div className="relative w-full h-auto bg-white rounded-xl shadow-xl overflow-hidden transform transition-transform hover:scale-105">
              <img
                src="/family.png"
                alt="Family Expenses Management"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "500px" }}
              />
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
              className="px-8 py-3 text-lg text-white bg-[#12A65C] hover:bg-[#0d8d4e] border-none relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg"
            >
              <Link href="/auth/signup" className="flex items-center">
                <span className="relative z-10">Create Free Account</span>
                <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                <span className="absolute bottom-0 left-0 w-full h-0.5 bg-white transform scale-x-0 group-hover:scale-x-100 transition-transform origin-center duration-300"></span>
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}
