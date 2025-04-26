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
import { useState, useEffect } from 'react';
import { Menu, X } from 'lucide-react';

// Define user types or roles
type NavLink = {
  href: string;
  label: string;
};

export default function Navbar() {
  const { user, signOut } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    // Determine which links to show based on the user's ID or metadata
    if (user) {
      // The specific user that should only see limited navigation
      const restrictedUserId = '0a29c8db-018c-49cb-ac35-7ccf1719be2c';
      
      if (user.id === restrictedUserId) {
        // Limited navigation for the specific user
        setNavLinks([
          { href: '/family', label: 'Family' },
          { href: '/about', label: 'About' },
          { href: '/contact', label: 'Contact' },
        ]);
      } else {
        // Full navigation for all other users
        setNavLinks([
          { href: '/family', label: 'Family' },
          { href: '/recurrent', label: 'Recurrent' },
          { href: '/sjprio', label: 'SJ Prio' },
          { href: '/amex', label: 'Amex' },
          { href: '/handelsbanken', label: 'Handelsbanken' },
          { href: '/global', label: 'Transactions' },
          { href: '/about', label: 'About' },
          { href: '/contact', label: 'Contact' },
        ]);
      }
    }
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      console.log('Logged out successfully');
    }
  };

  const handleLinkClick = () => {
    setIsMenuOpen(false); // Close the menu
  };

  return (
    <nav className="bg-gray-100 text-gray-800 p-4 flex justify-between items-center shadow-md relative">
      {/* Logo or App Name */}
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
        } absolute top-full left-0 w-full bg-white lg:bg-transparent lg:static lg:flex lg:items-center lg:gap-4 lg:w-auto z-50`}
      >
        {/* Dynamic Navigation Links */}
        <div className="flex flex-col gap-y-2 px-4 py-2 lg:flex-row lg:gap-4 lg:p-0 lg:rounded-md lg:border-t lg:border-gray-200 lg:border-b lg:border-gray-200">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block px-4 py-2 text-gray-800 hover:bg-gray-100 hover:text-green-600 transition-colors duration-200 hover:font-bold hover:bg-green-50 rounded-3xl"
              onClick={handleLinkClick}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* User Authentication */}
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
            <Link
              href="/auth/login"
              className="text-gray-800 border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-100 hover:underline hover:text-green-600 transition-colors duration-200 ml-auto"
            >
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}