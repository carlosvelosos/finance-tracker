import React from "react";
import { User } from "@supabase/auth-helpers-nextjs";

interface UsePageStateProps {
  loading: boolean;
  error: unknown;
  user: User | null;
}

interface PageStateResult {
  isReady: boolean;
  renderContent: () => React.ReactElement | null;
}

export function usePageState({
  loading,
  error,
  user,
}: UsePageStateProps): PageStateResult {
  const isReady = !loading && !error && !!user;

  const renderContent = (): React.ReactElement | null => {
    if (!user) {
      return (
        <div className="text-center mt-10">
          Please log in to view your transactions.
        </div>
      );
    }

    if (loading) {
      return <div className="text-center mt-10">Loading transactions...</div>;
    }

    if (error) {
      // Better error handling for unknown error types
      const errorMessage =
        error instanceof Error
          ? error.message
          : typeof error === "string"
            ? error
            : "Unknown error";

      return (
        <div className="text-center mt-10 text-red-500">
          Error loading transactions: {errorMessage}
        </div>
      );
    }

    return null;
  };

  return {
    isReady,
    renderContent,
  };
}
