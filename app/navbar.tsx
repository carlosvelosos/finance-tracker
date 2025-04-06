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

export default function Navbar() {
  const { user } = useAuth();

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
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: 'https://carlosvelosos.github.io/finance-tracker/', // Full redirect URL
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
      <div className="text-lg font-bold">Finance Tracker</div>
      <div className="flex items-center gap-4">
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