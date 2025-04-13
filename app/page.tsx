'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen">
      {/* Background Layer */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: "url('/finance-tracker/micheile-henderson-lZ_4nPFKcV8-unsplash.jpg')", // Use the correct path for GitHub Pages
          // backgroundImage: "url('/micheile-henderson-lZ_4nPFKcV8-unsplash.jpg')", // Use the correct path for GitHub Pages
          filter: 'saturate(0.75) brightness(0.75) contrast(1.05) grayscale(0.25)', // Apply filters only to the background
        }}
      ></div>

      {/* Content Layer */}
      <div className="relative flex flex-col items-center justify-center min-h-screen">
        <div className="text-center transform -translate-y-10 md:-translate-y-16">
          <h1 className="text-3xl md:text-5xl font-bold text-white drop-shadow-lg mb-1">
            Welcome to Finance Tracker
          </h1>
          <p className="text-base md:text-lg text-white drop-shadow-lg mb-1">
            Track your finances effortlessly. Manage your transactions, analyze your spending, and stay on top of your budget.
          </p>
          <nav className="flex justify-center gap-4">
            <Link href="/global" className="text-green-400 hover:underline">
              View Transactions
            </Link>
            <Link href="/about" className="text-green-400 hover:underline">
              About Us
            </Link>
            <Link href="/contact" className="text-green-400 hover:underline">
              Contact
            </Link>
          </nav>
        </div>
      </div>

      {/* Footer */}
      <footer className="absolute bottom-0 w-full text-center py-4 bg-black bg-opacity-50 text-white text-sm">
        © {new Date().getFullYear()} Finance Tracker. All rights reserved.
      </footer>
    </div>
  );
}