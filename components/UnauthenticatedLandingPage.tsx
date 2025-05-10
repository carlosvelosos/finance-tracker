"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function UnauthenticatedLandingPage() {
  return (
    <div className="relative flex flex-col items-center overflow-hidden">
      {" "}
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
        @keyframes borderGlow {
          0%,
          100% {
            opacity: 0.8;
            filter: blur(1px);
          }
          50% {
            opacity: 1;
            filter: blur(2px);
          }
        }
        .animate-border-glow {
          animation: borderGlow 2s ease-in-out infinite;
        }
        /* Add shadow glow utility */
        .hover\:shadow-glow:hover {
          box-shadow: 0 0 15px 3px rgba(18, 166, 92, 0.6);
        }

        /* Hero section sequential animations */
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        } /* Custom image scroll animation */
        @keyframes glimpseReveal {
          0% {
            clip-path: inset(0 0 90% 0);
          }
          10% {
            clip-path: inset(0 0 88% 0);
          }
          20% {
            clip-path: inset(0 0 90% 0);
          }
        }

        .animate-glimpse {
          animation: glimpseReveal 4s ease-in-out 1s forwards;
        }

        /* Dashboard container fade in animation */
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-dashboard-reveal {
          opacity: 0;
          animation: fadeIn 1s ease-out forwards;
          animation-delay: 1.5s;
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .animate-fadeInUp-delay-1 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
          animation-delay: 0.3s;
        }

        .animate-fadeInUp-delay-2 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
          animation-delay: 0.6s;
        }

        .animate-fadeInUp-delay-3 {
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
          animation-delay: 0.9s;
        }
      `}</style>
      {/* Hero Section - Dark background with modern design */}
      <section className="w-full relative flex flex-col items-center justify-center min-h-screen px-4 bg-black">
        {/* Abstract background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute rounded-full bg-[#12A65C] w-[500px] h-[500px] blur-3xl -top-[100px] -left-[200px] opacity-20"></div>
          <div className="absolute rounded-full bg-gray-500 w-[400px] h-[400px] blur-3xl bottom-[10%] right-[5%] opacity-10"></div>
          <div className="absolute rounded-full bg-[#12A65C] w-[300px] h-[300px] blur-3xl bottom-[20%] left-[10%] opacity-20"></div>
        </div>{" "}
        {/* Main content area */}
        <div className="relative z-10 max-w-7xl mx-auto flex flex-col items-center justify-center gap-20 px-4 min-h-[70vh]">
          {" "}
          <div className="text-center max-w-2xl mb-8">
            <h1 className="text-4xl md:text-7xl font-bold text-white leading-tight mb-6 animate-fadeInUp">
              All your <span className="text-[#12A65C]">global finances</span>,{" "}
              unified in one place
            </h1>{" "}
            <p className="text-lg md:text-xl text-gray-400 mb-8 mx-auto animate-fadeInUp-delay-1">
              Import transactions from Handelsbanken, SEB, American Express and
              more. Track spending categories and manage family expenses with a
              modern, intuitive interface.
            </p>{" "}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8 animate-fadeInUp-delay-2">
              <div className="group relative inline-flex rounded-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300 hover:shadow-glow">
                <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-[#12A65C]/30 via-[#12A65C] to-[#12A65C]/30 opacity-40 group-hover:opacity-100 group-hover:animate-border-glow"></div>
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-30 bg-[#12A65C] blur-[6px] transition-all duration-500"></div>
                <Link
                  href="/auth/signup"
                  className="relative z-10 inline-flex items-center justify-center bg-[#12A65C] hover:bg-[#0d8d4e] text-white px-8 py-3 text-lg font-medium rounded-xl transition-all duration-300"
                >
                  Get Started
                </Link>
              </div>

              <div className="group relative inline-flex rounded-xl overflow-hidden transform hover:-translate-y-1 transition-all duration-300">
                <div className="absolute inset-[-1px] rounded-xl bg-gradient-to-r from-[#12A65C]/30 via-[#12A65C] to-[#12A65C]/30 opacity-30 group-hover:opacity-70 transition-all duration-300"></div>
                <Link
                  href="/auth/login"
                  className="relative z-10 inline-flex items-center justify-center bg-zinc-900 text-white px-8 py-3 text-lg font-medium rounded-xl border border-[#12A65C]/30 group-hover:border-[#12A65C]/60 transition-all duration-300"
                >
                  Log In
                </Link>
              </div>
            </div>
            <p className="text-gray-500 text-sm animate-fadeInUp-delay-3">
              Simple setup - just upload your bank statements and start
              analyzing
            </p>
          </div>
        </div>{" "}
        {/* Dashboard Preview */}
        <div className="w-full max-w-4xl relative mt-16 mb-8 animate-dashboard-reveal">
          <div className="relative w-full bg-gradient-to-br from-black to-gray-900 rounded-2xl shadow-2xl overflow-hidden border border-gray-800 h-[420px]">
            <div className="absolute top-0 right-0 left-0 h-1.5 bg-gradient-to-r from-[#12A65C] to-green-400"></div>
            <img
              src="/handelsbanken-charts.png"
              alt="Finance Tracker Dashboard Preview"
              className="w-full object-cover object-top transition-all duration-500 transform hover:translate-y-[-90%]"
              style={{
                maxHeight: "600px",
                // clipPath: "inset(0 0 90% 0)",
                // animation: "glimpseReveal 4s ease-in-out 2s forwards",
              }}
            />{" "}
          </div>{" "}
          {/* Floating elements around dashboard */}
          <div
            className="absolute -top-4 -right-4 bg-gray-900 rounded-lg shadow-xl p-3 opacity-0 hidden md:block border border-gray-800 animate-fadeInUp-delay-3"
            style={{
              animation:
                "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite 2s, fadeIn 0.8s ease-out forwards 2s",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#12A65C]"></div>
              <span className="text-sm font-semibold text-white">
                Budget increased by 12%
              </span>
            </div>
          </div>
          <div
            className="absolute -bottom-2 -left-2 bg-gray-900 rounded-lg shadow-xl p-3 opacity-0 hidden md:block border border-gray-800 animate-fadeInUp-delay-3"
            style={{
              animation:
                "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite 2.5s, fadeIn 0.8s ease-out forwards 2.5s",
              animationDelay: "1s",
            }}
          >
            <div className="flex items-center gap-2">
              <div className="h-3 w-3 rounded-full bg-[#12A65C]"></div>
              <span className="text-sm font-semibold text-white">
                Spending reduced by 8%
              </span>
            </div>
          </div>
        </div>{" "}
        {/* Scroll indicator */}
        <div
          className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center opacity-0"
          style={{
            animation:
              "fadeIn 0.8s ease-out forwards 2.8s, bounce 2s ease-in-out infinite 3.6s",
          }}
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
      </section>{" "}
      {/* Transaction Upload Section with Split Design */}
      <section className="w-full py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#12A65C] opacity-5 rounded-3xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src="/upload.png"
                  alt="Upload Transactions Screenshot"
                  className="w-full h-auto object-cover"
                />
              </div>{" "}
              <div
                className="absolute -top-4 -right-4 bg-gray-900 rounded-lg shadow-xl p-3 opacity-90 hidden md:block border border-gray-800"
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
                  <span className="text-sm font-semibold text-white">
                    Upload complete
                  </span>
                </div>
              </div>
            </div>
          </div>{" "}
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Simple Transaction <span className="text-[#12A65C]">Upload</span>
            </h2>{" "}
            <p className="text-lg text-gray-300 mb-8">
              Upload your bank statements from Handelsbanken, SEB, American
              Express and more with just a few clicks. Our system helps organize
              your finances by bank and date, making it easy to track where your
              money goes.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Support for Swedish and international banks",
                "Compatible with CSV and XLS statement formats",
                "Date and currency format normalization",
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
                  <span className="text-gray-300">{feature}</span>
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
      </section>{" "}
      {/* Powerful Analytics Section */}
      <section className="w-full py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row-reverse items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#12A65C] opacity-5 rounded-3xl transform -rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src="/handelsbanken-charts.png"
                  alt="Financial Analytics Dashboard"
                  className="w-full h-auto object-cover"
                />
              </div>{" "}
              <div
                className="absolute -bottom-4 -left-4 bg-gray-900 rounded-lg shadow-xl p-3 opacity-90 hidden md:block border border-gray-800"
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
                  <span className="text-sm font-semibold text-white">
                    Savings up 15% this month
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Powerful <span className="text-[#12A65C]">Analytics</span>
            </h2>{" "}
            <p className="text-lg text-gray-300 mb-8">
              Gain insights into your spending habits with detailed charts for
              each bank account. Track categories, monitor monthly trends, and
              understand where your money goes with intuitive visualizations.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Bank-specific dashboards and analysis tools",
                "Category-based spending breakdowns",
                "Month-to-month comparison charts",
                "Combined view across all your accounts",
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
                  <span className="text-gray-300">{feature}</span>
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
      </section>{" "}
      {/* Family Expense Section */}
      <section className="w-full py-24 px-4 bg-black">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <div className="relative">
              <div className="absolute inset-0 bg-[#12A65C] opacity-5 rounded-3xl transform rotate-3"></div>
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-gray-800">
                <img
                  src="/family.png"
                  alt="Family Expenses Management"
                  className="w-full h-auto object-cover"
                />
              </div>
              <div
                className="absolute -top-4 -right-4 bg-gray-900 rounded-lg shadow-xl p-3 opacity-90 hidden md:block border border-gray-800"
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
                  <span className="text-sm font-semibold text-white">
                    Cost split complete
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="lg:w-1/2">
            <h2 className="text-3xl md:text-4xl font-bold mb-6 text-white">
              Family Expense <span className="text-[#12A65C]">Tracking</span>
            </h2>{" "}
            <p className="text-lg text-gray-300 mb-8">
              Share transaction access with family members using our advanced
              junction table system. Mark expenses as &quot;shared&quot; or
              assign responsibility to see a complete picture of household
              finances while maintaining proper access control.
            </p>
            <ul className="space-y-4 mb-8">
              {[
                "Secure transaction sharing between family members",
                "Track shared vs. individual expenses",
                "Mark transactions with responsible parties",
                "Family dashboard with comprehensive spending overview",
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
                  <span className="text-gray-300">{feature}</span>
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
                    d="M14 5l7 7m0 0l-7-7m7-7H3"
                  />
                </svg>
              </Link>
            </Button>
          </div>
        </div>
      </section>{" "}
      {/* CTA Section */}
      <section className="relative w-full py-32 bg-black border-t border-gray-800">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-blue-950/5 to-transparent pointer-events-none"></div>

        {/* Soft glow elements */}
        <div className="absolute left-1/4 top-1/4 w-64 h-64 bg-[#12A65C]/10 rounded-full blur-3xl opacity-20 transform -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute right-1/4 bottom-1/4 w-80 h-80 bg-blue-600/10 rounded-full blur-3xl opacity-20 transform translate-x-1/2 translate-y-1/2"></div>

        <div className="max-w-5xl mx-auto text-center relative z-10 px-4">
          {" "}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 tracking-tight">
            <span className="text-white">Track expenses across </span>
            <span className="text-[#12A65C]">multiple banks</span>
            <span className="text-white"> in one place.</span>
          </h2>{" "}
          <p className="text-xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Support for Handelsbanken, SEB, American Express, and more.
            Visualize spending across all your accounts.
          </p>{" "}
          <div className="mx-auto flex justify-center">
            <Button
              asChild
              className="group relative rounded-full p-px text-sm/6 text-zinc-400 duration-300 hover:text-zinc-100 hover:shadow-glow"
              type="button"
              aria-haspopup="dialog"
              aria-expanded="false"
              aria-controls="radix-:kv:pokg"
            >
              <Link href="/auth/signup">
                <span className="absolute inset-0 overflow-hidden rounded-full">
                  <span className="absolute inset-0 rounded-full bg-[image:radial-gradient(75%_100%_at_50%_0%,theme(colors.zinc.950/0.3)_0%,theme(colors.zinc.950)_100%)] opacity-0 transition-opacity duration-500 group-hover:opacity-100"></span>
                </span>{" "}
                {/* Glowing border effect */}
                <span className="absolute inset-[-1px] rounded-full bg-gradient-to-r from-[#12A65C]/30 via-[#12A65C] to-[#12A65C]/30 opacity-0 group-hover:opacity-100 group-hover:animate-border-glow"></span>
                {/* Inner glow effect */}
                <span className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-30 bg-[#12A65C] blur-[6px] transition-all duration-500"></span>{" "}
                <div className="relative z-10 rounded-full bg-zinc-950 px-4 py-1.5 ring-1 ring-white/10">
                  Get Started Now
                </div>
                <span className="absolute -bottom-0 left-[1.125rem] h-px w-[calc(100%-2.25rem)] bg-gradient-to-r from-emerald-400/0 via-emerald-400/90 to-emerald-400/0 transition-opacity duration-500 group-hover:opacity-40"></span>
              </Link>
            </Button>
          </div>
          <div className="mt-10 text-sm text-gray-500">
            Free to use. Setup takes just minutes with support for
            Handelsbanken, SEB, AmEx and more.
          </div>{" "}
        </div>
        {/* Subtle animated gradient line */}
        <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-gray-700 to-transparent"></div>
      </section>
    </div>
  );
}
