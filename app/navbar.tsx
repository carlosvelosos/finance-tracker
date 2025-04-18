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
          ? 'https://finance-tracker-steel-five.vercel.app/' // Deployed version
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

  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu
  };

  return (
    <nav className="bg-gray-100 text-gray-800 p-4 flex justify-between items-center shadow-md relative">
      {/* Logo or App Name */}
      {/* <div className="lg:w-210 text-lg font-bold"> */}
      <div className="text-lg font-bold">
        <Link href="/" className="text-green-600 block px-4 py-2 hover:bg-green-50 hover:border hover:border-gray-500 rounded-3xl transition duration-300 ease-in-out">
          Finance Tracker
        </Link>
      </div>

      {/* Hamburger Menu for Small Screens */}
      <div className="lg:hidden">
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
        // } absolute top-full left-0 w-full bg-white shadow-md lg:static lg:flex lg:items-center lg:gap-4 lg:w-auto lg:rounded-md z-50 border border-red-500`}
        } absolute top-full left-0 w-full bg-white lg:bg-transparent lg:static lg:flex lg:items-center lg:gap-4 lg:w-auto z-50`}
      >
        {/* Navigation Links */}
        <div className="flex flex-col gap-y-2 px-4 py-2 lg:flex-row lg:gap-4 lg:p-0 lg:rounded-md lg:border-t lg:border-gray-200 lg:border-b lg:border-gray-200">
          <Link
            href="/family"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
            >
            Family
          </Link>
          <Link
            href="/recurrent"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            Recurrent
          </Link>
          <Link
            href="/sjprio"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            SJ Prio
          </Link>
          <Link
            href="/amex"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            Amex
          </Link>
          <Link
            href="/handelsbanken"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            Handelsbanken
          </Link>
          <Link
            href="/global"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            Transactions
          </Link>
          <Link
            href="/about"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            About
          </Link>
          <Link
            href="/contact"
            className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
            onClick={handleLinkClick} // Close menu on click
          >
            Contact
          </Link>
        </div>

        {/* User Authentication */}
        {/* <div className="lg:w-60 flex flex-col gap-y-2 px-4 py-2 border-t border-gray-200 lg:border-none lg:flex-row lg:gap-4 lg:p-0 text-right"> */}
        {/* <div className="lg:w-210 flex flex-col gap-y-2 px-4 py-2 border-t border-gray-200 lg:border-none lg:flex-row lg:gap-4 lg:p-0"> */}
        <div className="flex flex-col gap-y-2 px-4 py-2 border-t border-gray-200 lg:border-none lg:flex-row lg:gap-4 lg:p-0">
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="text-gray-800 lg:ml-auto">
                  {user.email}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-gray-100 text-gray-800 shadow-md rounded-md lg:w-55">
                <DropdownMenuItem
                  className="cursor-pointer hover:bg-gray-200 hover:underline hover:text-green-600 transition-colors duration-200"
                >
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="cursor-pointer hover:bg-gray-200 hover:underline hover:text-green-600 transition-colors duration-200"
                >
                  Log Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              onClick={handleLogin}
              variant="ghost"
              className="text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 hover:underline hover:text-green-600 transition-colors duration-200 ml-auto"
            >
              Log In
            </Button>
          )}
        </div>
      </div>
    </nav>
  );
}