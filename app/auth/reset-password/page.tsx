"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";
// Remove unused AuthError import
// import { AuthError } from "@supabase/supabase-js";

export default function ResetPasswordPage() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  // Keep isTokenInUrl state as it's used in your form submission logic
  const [isTokenInUrl, setIsTokenInUrl] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Check if we need to use the token from URL (for private browsing)
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");

      let result;
      if (token || isTokenInUrl) {
        // Use isTokenInUrl state here
        // Use token directly from URL
        console.log("Using token from URL for password reset");
        result = await supabase.auth.updateUser(
          { password },
          { emailRedirectTo: window.location.origin }
        );
      } else {
        // Use existing session
        result = await supabase.auth.updateUser({ password });
      }

      if (result.error) {
        throw result.error;
      }

      toast.success("Password updated successfully!");
      router.push("/auth/login?message=password_updated");
    } catch (error: unknown) {
      // Error handling...
      console.error("Password update error:", error);
      toast.error(
        error instanceof Error ? error.message : "Failed to update password"
      );
    } finally {
      setLoading(false);
    }
  };

  // Ensure user has a valid password reset token
  useEffect(() => {
    const checkSession = async () => {
      console.log("Checking session on reset password page");

      try {
        const { data, error: sessionError } = await supabase.auth.getSession(); // Rename to avoid unused variable

        if (sessionError) {
          console.error("Session error:", sessionError);
          toast.error("Invalid or expired reset link");
          router.push("/auth/login");
          return;
        }

        if (!data.session) {
          console.log("No session found, checking URL params");

          // Check if we have token in URL (fallback for private browsing)
          const urlParams = new URLSearchParams(window.location.search);
          const token = urlParams.get("token");

          if (token) {
            console.log("Found token in URL");
            setIsTokenInUrl(true);
            // Continue with reset flow even without session
            return;
          }

          toast.error("No active session found");
          router.push("/auth/login");
          return;
        }

        console.log("Valid session detected");
      } catch (e) {
        console.error("Session check error:", e);
        toast.error("Error checking authentication status");
        router.push("/auth/login");
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md">
        <div className="flex justify-center mb-6">
          <div className="bg-black text-white p-2 rounded-md">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
              <path d="M3 9h18" />
            </svg>
          </div>
          <span className="ml-2 text-xl font-semibold">Finance Tracker</span>
        </div>

        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">
              Set new password
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  New password
                </label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={loading}
                />
                <p className="mt-1 text-xs text-gray-500">
                  Must be at least 8 characters with a number and special
                  character
                </p>
              </div>

              <div className="mb-6">
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Confirm new password
                </label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full"
                  disabled={loading}
                />
              </div>

              <Button
                type="submit"
                className="w-full bg-black hover:bg-gray-800 text-white"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update password"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
