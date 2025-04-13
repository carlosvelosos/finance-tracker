'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="flex flex-col items-center justify-start min-h-screen p-4 pt-60">
      <h1 className="text-4xl font-bold text-center mb-1">Welcome to Finance Tracker</h1>
      <p className="text-center mb-1">
        Track your finances effortlessly. Manage your transactions, analyze your spending, and stay on top of your budget.
      </p>
      <nav className="flex justify-center gap-4">
        <Link href="/global" className="text-blue-500 hover:underline">
          View Transactions
        </Link>
        <Link href="/about" className="text-blue-500 hover:underline">
          About Us
        </Link>
        <Link href="/contact" className="text-blue-500 hover:underline">
          Contact
        </Link>
      </nav>
    </div>
  );
}