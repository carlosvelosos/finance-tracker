"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge"; // Make sure you have this component, e.g., from Shadcn UI

// Bank structure from prompt
const countriesData: Record<string, string[]> = {
  Brazil: [
    "Inter",
    "Nubank",
    "Santander",
    "Banco do Brasil",
    "Caixa",
    "Bradesco",
    "Rico",
    "Clear",
    "Smiles",
    "Latam",
    "Azul",
    "Esfera",
    "Livelo",
  ],
  Sweden: ["Handelsbanken", "SEB", "American Express"],
};

interface BankAccountInfo {
  name: string;
  supabaseTable: string;
  isActive: boolean;
  lastModified?: string;
  latestEntry?: any;
  error?: string;
  isLoading: boolean;
}

// Helper to generate Supabase table name (example convention)
const generateSupabaseTableName = (bankName: string): string => {
  // Sanitize bank name for table name (lowercase, replace spaces and special chars with underscore)
  const sanitizedName = bankName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
  return `transactions_${sanitizedName}`;
};

export default function ProfilePage() {
  const [bankAccounts, setBankAccounts] = useState<
    Record<string, BankAccountInfo[]>
  >({});
  const [isInitialLoading, setIsInitialLoading] = useState<boolean>(true);

  useEffect(() => {
    const initializeBankAccounts = () => {
      const initialAccounts: Record<string, BankAccountInfo[]> = {};
      for (const [country, banks] of Object.entries(countriesData)) {
        initialAccounts[country] = banks.map((bankName) => ({
          name: bankName,
          supabaseTable: generateSupabaseTableName(bankName),
          isActive: true, // Default, should ideally be fetched from user settings
          isLoading: true,
        }));
      }
      setBankAccounts(initialAccounts);
      setIsInitialLoading(false); // Done with initial structure setup
      return initialAccounts;
    };

    const fetchAllBankData = async (
      initialAccounts: Record<string, BankAccountInfo[]>,
    ) => {
      for (const country in initialAccounts) {
        for (const account of initialAccounts[country]) {
          fetchBankDetails(country, account.name, account.supabaseTable);
        }
      }
    };

    const initialStructure = initializeBankAccounts();
    fetchAllBankData(initialStructure);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const fetchBankDetails = async (
    country: string,
    bankName: string,
    tableName: string,
  ) => {
    let lastModified: string | undefined;
    let latestEntry: any | undefined;
    let errorMsg: string | undefined;

    try {
      // Fetch latest entry.
      // IMPORTANT: Adjust 'created_at' to your actual timestamp column (e.g., 'date', 'transaction_date')
      // or use 'id' if it's an auto-incrementing primary key.
      const { data: latestEntryData, error: dbError } = await supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false }) // Or e.g., .order("id", { ascending: false })
        .limit(1)
        .maybeSingle(); // Use maybeSingle to handle empty tables gracefully (returns null instead of error)

      if (dbError) {
        // PGRST116 is for "relation not found" or similar issues if .single() was used and no row.
        // maybeSingle() avoids this specific error for empty tables.
        // Check for other errors like table not found (e.g., dbError.code === '42P01' for PostgreSQL)
        console.error(`Error fetching latest entry for ${tableName}:`, dbError);
        errorMsg = `Data fetch failed: ${dbError.message}`;
        lastModified = "Error";
      } else if (latestEntryData) {
        latestEntry = latestEntryData;
        // Assuming the latest entry's timestamp column is 'created_at'
        // Adjust this if your timestamp column has a different name.
        lastModified = latestEntryData.created_at
          ? new Date(latestEntryData.created_at).toLocaleString()
          : latestEntryData.date
            ? new Date(latestEntryData.date).toLocaleString()
            : "N/A";
      } else {
        lastModified = "No entries yet";
        latestEntry = null;
      }
    } catch (e: any) {
      console.error(`Exception fetching data for ${tableName}:`, e);
      errorMsg = `Exception: ${e.message}`;
      lastModified = "Error";
    }

    setBankAccounts((prev) => {
      const updatedCountryAccounts =
        prev[country]?.map((acc) =>
          acc.name === bankName
            ? {
                ...acc,
                latestEntry,
                lastModified,
                error: errorMsg,
                isLoading: false,
              }
            : acc,
        ) || [];
      return { ...prev, [country]: updatedCountryAccounts };
    });
  };

  const handleToggleAccountStatus = (
    country: string,
    bankName: string,
    isActive: boolean,
  ) => {
    setBankAccounts((prev) => {
      const updatedCountryAccounts = prev[country].map((acc) =>
        acc.name === bankName ? { ...acc, isActive } : acc,
      );
      return { ...prev, [country]: updatedCountryAccounts };
    });
    // TODO: Persist this 'isActive' change to Supabase (e.g., in a user_settings table).
    console.log(
      `Toggled ${bankName} in ${country} to ${isActive ? "active" : "inactive"}. Persistence needed.`,
    );
  };

  if (isInitialLoading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p>Loading page structure...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-8 text-center">
        Profile & Bank Configurations
      </h1>
      {Object.entries(bankAccounts).map(([country, accounts]) => (
        <div key={country} className="mb-10">
          <h2 className="text-2xl font-semibold mb-6 border-b pb-2">
            {country}
          </h2>
          {accounts.length === 0 && !isInitialLoading && (
            <p>No banks configured for this country.</p>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {accounts.map((account) => (
              <Card key={account.supabaseTable} className="flex flex-col">
                <CardHeader>
                  <CardTitle className="flex justify-between items-start">
                    <span>{account.name}</span>
                    <Badge variant="outline" className="whitespace-nowrap">
                      {account.supabaseTable}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    Status:{" "}
                    {account.isActive ? (
                      <span className="text-green-600 font-medium">Active</span>
                    ) : (
                      <span className="text-red-600 font-medium">Inactive</span>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-grow">
                  {account.isLoading ? (
                    <div className="space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse"></div>
                      <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
                      <div className="h-8 bg-gray-200 rounded w-full animate-pulse mt-2"></div>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 mb-4">
                        <Switch
                          id={`switch-${country}-${account.name.replace(/\s+/g, "-")}`}
                          checked={account.isActive}
                          onCheckedChange={(checked) =>
                            handleToggleAccountStatus(
                              country,
                              account.name,
                              checked,
                            )
                          }
                          aria-label={`Toggle account status for ${account.name}`}
                        />
                        <Label
                          htmlFor={`switch-${country}-${account.name.replace(/\s+/g, "-")}`}
                        >
                          {account.isActive ? "Deactivate" : "Activate"}
                        </Label>
                      </div>
                      <p className="text-sm text-gray-600 mb-1">
                        <span className="font-medium">Last Update:</span>{" "}
                        {account.lastModified || "N/A"}
                      </p>
                      {account.error && (
                        <p className="text-sm text-red-500 mt-1">
                          Error: {account.error}
                        </p>
                      )}

                      {account.latestEntry && (
                        <Accordion
                          type="single"
                          collapsible
                          className="w-full mt-3"
                        >
                          <AccordionItem
                            value={`entry-${account.supabaseTable}`}
                          >
                            <AccordionTrigger className="text-sm">
                              View Latest Entry
                            </AccordionTrigger>
                            <AccordionContent>
                              <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded-md overflow-x-auto text-xs max-h-60">
                                {JSON.stringify(account.latestEntry, null, 2)}
                              </pre>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      )}
                      {!account.latestEntry &&
                        !account.error &&
                        !account.isLoading && (
                          <p className="text-sm text-gray-500 mt-2">
                            No recent entries found for this account.
                          </p>
                        )}
                    </>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
