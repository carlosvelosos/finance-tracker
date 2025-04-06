'use client';

import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../context/AuthContext';

export const AuthButtons = () => {
  const { user } = useAuth();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
    });
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  return user ? (
    <button onClick={handleLogout}>Logout</button>
  ) : (
    <button onClick={handleLogin}>Login with GitHub</button>
  );
};
