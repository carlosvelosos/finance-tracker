import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const type = requestUrl.searchParams.get('type');
  const next = requestUrl.searchParams.get('next') || '/';
  
  if (code) {
    const cookieStore = cookies();
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    try {
      // Log what's happening
      console.log("Processing auth callback", { type, code: code.substring(0, 5) + "..." });
      
      // Exchange code for session
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      
      if (error) {
        console.error("Session exchange error:", error);
        // Still redirect to reset password for recovery flow
        if (type === 'recovery') {
          return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin));
        }
        // Otherwise redirect to login with error
        return NextResponse.redirect(new URL('/auth/login?error=session_exchange', requestUrl.origin));
      }
      
      // Explicitly redirect recovery flows
      if (type === 'recovery') {
        return NextResponse.redirect(new URL('/auth/reset-password', requestUrl.origin));
      }
    } catch (e) {
      console.error("Auth callback error:", e);
      // Add error handling redirect
      return NextResponse.redirect(new URL('/auth/login?error=unexpected', requestUrl.origin));
    }
  }

  // Default redirect
  return NextResponse.redirect(new URL(next || '/', requestUrl.origin));
}