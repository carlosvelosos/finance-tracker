'use client';

import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabaseClient';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import Link from 'next/link';
import { useState } from 'react';
import { Menu, X } from 'lucide-react'; // Icons for the hamburger menu

export default function Navbar() {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      console.log('Logged out successfully');
    }
  };

  const handleLogin = async () => {
    const email = prompt('Please enter your email:');
    if (email) {
      const redirectUrl =
        process.env.NODE_ENV === 'production'
          ? 'https://carlosvelosos.github.io/finance-tracker/' // Deployed version
          : 'http://localhost:3000'; // Local development version

      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
        },
      });

      if (error) {
        console.error('Error sending magic link:', error);
      } else {
        console.log('Magic link sent to your email!');
      }
    }
  };

  return (
    <nav className="bg-white text-gray-800 p-4 flex justify-between items-center shadow-md">
      {/* Logo or App Name */}
      <div className="text-lg font-bold">
        <Link href="/" className="text-green-600 hover:underline">
          Finance Tracker
        </Link>
      </div>

      {/* Hamburger Menu for Small Screens */}
      <div className="md:hidden">
        <button
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="text-gray-800 focus:outline-none"
        >
          {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div
        className={`${
          isMenuOpen ? 'block' : 'hidden'
        } absolute top-16 left-0 w-full bg-white shadow-md md:static md:flex md:items-center md:gap-4 md:w-auto`}
      >
        <Link href="/sjprio" className="block px-4 py-2 text-gray-800 hover:underline md:inline">
          SJ Prio
        </Link>
        <Link href="/amex" className="block px-4 py-2 text-gray-800 hover:underline md:inline">
          Amex
        </Link>
        <Link href="/handelsbanken" className="block px-4 py-2 text-gray-800 hover:underline md:inline">
          Handelsbanken
        </Link>
        <Link href="/global" className="block px-4 py-2 text-gray-800 hover:underline md:inline">
          Transactions
        </Link>
        <Link href="/about" className="block px-4 py-2 text-gray-800 hover:underline md:inline">
          About
        </Link>
        <Link href="/contact" className="block px-4 py-2 text-gray-800 hover:underline md:inline">
          Contact
        </Link>

        {/* User Authentication */}
        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="text-gray-800">
                {user.email}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-100 text-gray-800 shadow-md rounded-md">
              <DropdownMenuItem className="cursor-pointer">Profile</DropdownMenuItem>
              <DropdownMenuItem
                onClick={handleLogout}
                className="cursor-pointer hover:bg-gray-200"
              >
                Log Out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            onClick={handleLogin}
            variant="ghost"
            className="text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100"
          >
            Log In
          </Button>
        )}
      </div>
    </nav>
  );
}