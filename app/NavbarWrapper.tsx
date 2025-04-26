'use client';

import { useAuth } from '../context/AuthContext';
import Navbar from './navbar';

export default function NavbarWrapper() {
  const { user, loading } = useAuth();
  
  // Don't render anything while authentication is being checked
  if (loading) return null;
  
  // Only render the navbar if the user is authenticated
  return user ? <Navbar /> : null;
}