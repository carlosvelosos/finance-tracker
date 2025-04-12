'use client';

import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold text-center mb-6">Welcome to Finance Tracker</h1>
      <p className="text-center mb-8">
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