"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthenticatedLandingPage() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden">
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.7;
          }
        }
        .animate-pulse-slow {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        .animate-pulse-delay {
          animation: pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite;
          animation-delay: 1s;
        }
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce-slow {
          animation: bounce 2s ease-in-out infinite;
        }
      `}</style>

      {/* Hero Section - Dark background with modern design */}
      <section className="w-full relative flex flex-col items-center justify-center min-h-screen px-4 bg-black">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute rounded-full bg-[#12A65C] w-[500px] h-[500px] blur-3xl -top-[100px] -left-[200px] opacity-20"></div>
          <div className="absolute rounded-full bg-gray-500 w-[400px] h-[400px] blur-3xl bottom-[10%] right-[5%] opacity-10"></div>
          <div className="absolute rounded-full bg-[#12A65C] w-[300px] h-[300px] blur-3xl bottom-[20%] left-[10%] opacity-20"></div>
        </div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12 px-4">
          <div className="lg:w-1/2 text-left max-w-xl">
            <h1 className="text-4xl md:text-7xl font-bold text-white leading-tight mb-6">
              Unleash the power of{" "}
              <span className="text-[#12A65C]">intuitive finance</span>
            </h1>
            <p className="text-lg md:text-xl text-gray-400 mb-8 max-w-lg">
              Say goodbye to outdated financial tools. Track your finances
              effortlessly, manage your transactions, and stay on top of your
              budget with a modern, intuitive interface.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 mb-8">
              <Button
                asChild
                className="bg-[#12A65C] hover:bg-[#0d8d4e] text-white px-8 py-4 text-lg rounded-xl relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-none"
              >
                <Link href="/auth/signup" className="flex items-center">
                  <span className="relative z-10 font-medium">Get Started</span>
                  <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="text-white border-[#12A65C] border-2 hover:bg-[#12A65C] hover:bg-opacity-10 px-8 py-4 text-lg rounded-xl relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl"
              >
                <Link href="/auth/login" className="flex items-center">
                  <span className="relative z-10 font-medium">Log In</span>
                </Link>
              </Button>
            </div>
            <p className="text-gray-500 text-sm">
              Join thousands of users already managing their finances smarter
            </p>
          </div>
          <div className="lg:w-1/2 relative">
            <div className="relative w-full bg-gradient-to-br from-black to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800">
              <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#12A65C] to-green-400"></div>
              <img
                src="/handelsbanken-charts.png"
                alt="Finance Tracker Dashboard Preview"
                className="w-full h-auto object-cover"
                style={{ maxHeight: "600px" }}
              />
            </div>
            {/* Floating elements around dashboard */}
            <div
              className="absolute -top-4 -right-4 bg-white rounded-lg shadow-xl p-3 opacity-90 hidden md:block"
              style={{
                animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#12A65C]"></div>
                <span className="text-sm font-semibold text-gray-800">
                  Budget increased by 12%
                </span>
              </div>
            </div>
            <div
              className="absolute -bottom-2 -left-2 bg-white rounded-lg shadow-xl p-3 opacity-90 hidden md:block"
              style={{
                animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                animationDelay: "1s",
              }}
            >
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-[#12A65C]"></div>
                <span className="text-sm font-semibold text-gray-800">
                  Spending reduced by 8%
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center"
          style={{ animation: "bounce 2s ease-in-out infinite" }}
        >
          <span className="text-gray-500 text-sm mb-2">Scroll to explore</span>
          <svg
            className="w-6 h-6 text-gray-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 14l-7 7m0 0l-7-7m7 7V3"
            />
          </svg>
        </div>
      </section>

      {/* Features Section with Cards */}
      <section className="w-full py-20 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-gray-900">
              Everything you need.{" "}
              <span className="text-[#12A65C]">Nothing you don't.</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Financial management and visibility in one place. Experience a
              flexible toolkit that makes every task feel like a breeze.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Feature Card 1 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 bg-[#12A65C] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#12A65C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Insights at your fingertips
              </h3>
              <p className="text-gray-600">
                All your data and finances in one place to provide quick answers
                and make decisions instantly.
              </p>
            </div>

            {/* Feature Card 2 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 bg-[#12A65C] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#12A65C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Manage in real time
              </h3>
              <p className="text-gray-600">
                Have full control of your finances on the go. Track expenses and
                income as they happen, not days later.
              </p>
            </div>

            {/* Feature Card 3 */}
            <div className="bg-white p-8 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
              <div className="w-12 h-12 bg-[#12A65C] bg-opacity-10 rounded-full flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-[#12A65C]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-3 text-gray-900">
                Family Expense Tracking
              </h3>
              <p className="text-gray-600">
                Easily manage shared expenses and split costs between family
                members. Ensure everyone contributes fairly.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Transaction Upload Section with Split Design */}
      <section className="w-full py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#12A65C] opacity-5 rounded-3xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="/upload.png"
                  alt="Upload Transactions Screenshot"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-xl p-3 opacity-90 hidden md:block"
                style={{
                  animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#12A65C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">
                    Upload complete
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Simple Transaction <span className="text-[#12A65C]">Upload</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Upload your bank statements and credit card transactions with just
              a few clicks. Our system automatically categorizes your expenses,
              making it easy to track where your money goes.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Automatic categorization of transactions",
                "Support for multiple bank formats",
                "Instant visualization of your spending patterns",
                "Secure and private data processing",
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1 mr-3 w-5 h-5 bg-[#12A65C] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-[#12A65C]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-xl relative overflow-hidden group transition-all duration-300"
            >
              <Link href="/auth/signup" className="flex items-center">
                <span className="relative z-10 font-medium">Try It Now</span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Powerful Analytics Section */}
      <section className="w-full py-24 px-4 bg-gray-50">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-black opacity-5 rounded-3xl transform -rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="/handelsbanken-charts.png"
                  alt="Financial Analytics Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div
                className="absolute -bottom-4 -left-4 bg-white rounded-lg shadow-xl p-3 opacity-90 hidden md:block"
                style={{
                  animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  animationDelay: "1.5s",
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#12A65C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">
                    Savings up 15% this month
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Powerful <span className="text-[#12A65C]">Analytics</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Gain insights into your spending habits and track financial
              patterns over time. Our interactive charts and reports help you
              make better financial decisions by visualizing your data.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Beautiful visual representations of your financial data",
                "Track spending patterns across categories",
                "Identify opportunities for savings",
                "Compare month-to-month performance",
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1 mr-3 w-5 h-5 bg-[#12A65C] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-[#12A65C]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-xl relative overflow-hidden group transition-all duration-300"
            >
              <Link href="/auth/signup" className="flex items-center">
                <span className="relative z-10 font-medium">
                  Explore Analytics
                </span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Family Expense Section */}
      <section className="w-full py-24 px-4 bg-white">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#12A65C] opacity-5 rounded-3xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-100">
                <img
                  src="/family.png"
                  alt="Family Expenses Management"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div
                className="absolute -top-4 -right-4 bg-white rounded-lg shadow-xl p-3 opacity-90 hidden md:block"
                style={{
                  animation: "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
                  animationDelay: "0.5s",
                }}
              >
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-[#12A65C]"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-gray-800">
                    Cost split complete
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-gray-900">
              Family Expense <span className="text-[#12A65C]">Tracking</span>
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Easily manage shared expenses and split costs between family
              members. Keep track of who paid what and ensure everyone
              contributes their fair share to household finances.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Equitable splitting of shared expenses",
                "Track individual contributions",
                "Manage recurring household bills",
                "Transparent financial management for the whole family",
              ].map((feature, index) => (
                <li key={index} className="flex items-start">
                  <div className="mt-1 mr-3 w-5 h-5 bg-[#12A65C] bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0">
                    <svg
                      className="w-3 h-3 text-[#12A65C]"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <span className="text-gray-700">{feature}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              className="bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-xl relative overflow-hidden group transition-all duration-300"
            >
              <Link href="/auth/signup" className="flex items-center">
                <span className="relative z-10 font-medium">
                  Start Family Tracking
                </span>
                <svg
                  className="w-5 h-5 ml-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14 5l7 7m0 0l-7 7m7-7H3"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="w-full py-24 px-4 bg-black">
        <div className="max-w-4xl mx-auto text-center relative">
          {/* Background decoration elements */}
          <div className="absolute top-0 left-0 w-20 h-20 bg-[#12A65C] rounded-full opacity-10 blur-xl"></div>
          <div className="absolute bottom-0 right-0 w-40 h-40 bg-[#12A65C] rounded-full opacity-10 blur-xl"></div>

          <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">
            See where financial{" "}
            <span className="text-[#12A65C]">automation</span> can take you
          </h2>
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto">
            The first financial tool you'll love. And the last one you'll ever
            need.
          </p>
          <Button
            asChild
            className="bg-[#12A65C] hover:bg-[#0d8d4e] text-white px-10 py-5 text-lg rounded-xl relative overflow-hidden group transition-all duration-300 transform hover:-translate-y-1 hover:shadow-xl border-none"
          >
            <Link href="/auth/signup" className="flex items-center">
              <span className="relative z-10 font-medium">
                Create Free Account
              </span>
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-10 transition-opacity duration-300"></span>
            </Link>
          </Button>
          <p className="text-gray-500 text-sm mt-8">
            Join thousands of users who are taking control of their finances
            with our tools
          </p>
        </div>
      </section>
    </div>
  );
}
