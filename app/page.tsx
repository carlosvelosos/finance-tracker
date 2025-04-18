'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="relative min-h-screen bg-gray-100">
      {/* Background Layer */}
      {/* <div
      className="absolute inset-0 bg-cover bg-center"
      style={{
        backgroundImage: "url('/micheile-henderson-lZ_4nPFKcV8-unsplash.jpg')", // Use the correct path for GitHub Pages
        filter: 'saturate(0.75) brightness(0.75) contrast(1.05) grayscale(0.25)', // Apply filters only to the background
      }}
      ></div> */}

      {/* Content Layer */}
      <div className="relative flex flex-col items-center justify-center min-h-screen">
      <div className="text-center transform -translate-y-10 md:-translate-y-16">
        <h1 className="text-2xl md:text-6xl font-bold" style={{ color: '#303030' }}>
        Welcome to Finance Tracker
        </h1>
        <p className="text-sm md:text-lg drop-shadow-lg mb-1" style={{ color: '#303030' }}>
        Track your finances effortlessly. Manage your transactions, analyze your spending, and stay on top of your budget.
        </p>
        <nav className="flex justify-center gap-4 mt-8">
        <Link href="/upload" className="text-[rgb(18,166,92)] hover:underline">
          Upload expenses
        </Link>
        <Link href="/about" className="text-[rgb(18,166,92)] hover:underline">
          About Us
        </Link>
        <Link href="/contact" className="text-[rgb(18,166,92)] hover:underline">
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