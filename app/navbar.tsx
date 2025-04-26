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
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [navLinks, setNavLinks] = useState<NavLink[]>([]);

  useEffect(() => {
    // Determine which links to show based on the user's ID or metadata
    if (user) {
      // List of users that should only see limited navigation
      const restrictedUserIds = [
        '0a29c8db-018c-49cb-ac35-7ccf1719be2c', 
        '382714ae-4c7c-4a32-9a7d-8b530fbd7ab3'
      ];
      
      // Check if the current user's ID is in the restricted list
      if (restrictedUserIds.includes(user.id as string)) {
        // Limited navigation for restricted users
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
                <Button variant="outline" className="flex items-center gap-2 px-3 py-2 rounded-full bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 lg:ml-auto">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-semibold">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <span className="max-w-[150px] truncate">{user.email}</span>
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56 p-1.5 bg-white border border-gray-200 shadow-lg rounded-lg mt-1">
                <div className="px-3 py-2 mb-1 border-b border-gray-100">
                  <p className="text-sm font-medium text-gray-900">{user.email}</p>
                  <p className="text-xs text-gray-500 mt-0.5 truncate">
                    Account ID: {user.id?.substring(0, 8)}...
                  </p>
                </div>
                
                <DropdownMenuItem className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer rounded-md hover:bg-gray-50">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M20.5899 22C20.5899 18.13 16.7399 15 11.9999 15C7.25991 15 3.40991 18.13 3.40991 22" stroke="#4B5563" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium text-gray-700">Profile</span>
                </DropdownMenuItem>
                
                <DropdownMenuItem 
                  onClick={handleLogout}
                  className="flex items-center gap-2.5 px-3 py-2.5 text-sm cursor-pointer rounded-md hover:bg-red-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.90002 7.55999C9.21002 3.95999 11.06 2.48999 15.11 2.48999H15.24C19.71 2.48999 21.5 4.27999 21.5 8.74999V15.27C21.5 19.74 19.71 21.53 15.24 21.53H15.11C11.09 21.53 9.24002 20.08 8.91002 16.54" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M15 12H3.62" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M5.85 8.6499L2.5 11.9999L5.85 15.3499" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <span className="font-medium text-red-600">Log Out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Link
              href="/auth/login"
              className="flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 border border-green-200 text-green-700 hover:bg-green-100 transition-colors duration-200 font-medium lg:ml-auto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M8.90002 16.44C9.21002 20.04 11.06 21.51 15.11 21.51H15.24C19.71 21.51 21.5 19.72 21.5 15.25V8.73C21.5 4.26 19.71 2.47 15.24 2.47H15.11C11.09 2.47 9.24002 3.92 8.91002 7.46" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 12H3.62" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M5.85 8.6499L2.5 11.9999L5.85 15.3499" stroke="#059669" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              Log In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}