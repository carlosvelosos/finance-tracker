"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import type { User } from "@supabase/supabase-js"; // Import User type
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input"; // Added for table name editing
import { Button } from "@/components/ui/button"; // Added for save/cancel buttons
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
  supabaseTable: string; // This will be the actual table name to use (custom or default)
  isActive: boolean;
  lastModified?: string;
  latestEntry?: any;
  error?: string;
  isLoading: boolean;
  isEditingTableName?: boolean; // New: To control edit mode for table name
  tempSupabaseTable?: string; // New: To hold table name during editing
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
  const [currentUser, setCurrentUser] = useState<User | null>(null); // State for current user

  useEffect(() => {
    const setupPage = async () => {
      setIsInitialLoading(true);
      const {
        data: { session },
        error: sessionError,
      } = await supabase.auth.getSession();

      if (sessionError) {
        console.error("Error getting session:", sessionError);
        setIsInitialLoading(false);
        // TODO: Handle session error, e.g., show a message or redirect
        return;
      }

      if (session?.user) {
        setCurrentUser(session.user);
        await loadInitialBankData(session.user.id);
      } else {
        console.log("No user session found. Redirecting or showing login.");
        setIsInitialLoading(false);
        // TODO: Handle no user session, e.g., redirect to login page
      }
    };

    setupPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const loadInitialBankData = async (userId: string) => {
    const { data: userSettings, error: settingsError } = await supabase
      .from("user_bank_settings")
      .select("*")
      .eq("user_id", userId);

    if (settingsError) {
      console.error("Error fetching user bank settings:", settingsError);
      // Continue with defaults, but log the error. User might not have settings yet.
    }

    const settingsMap = new Map(
      userSettings?.map((s) => [`${s.country}-${s.bank_name}`, s]),
    );
    const initialAccountsSetup: Record<string, BankAccountInfo[]> = {};

    for (const [country, banks] of Object.entries(countriesData)) {
      initialAccountsSetup[country] = banks.map((bankName) => {
        const settingKey = `${country}-${bankName}`;
        const setting = settingsMap.get(settingKey);

        const defaultSupabaseTable = generateSupabaseTableName(bankName);
        const actualSupabaseTable =
          setting?.custom_supabase_table_name || defaultSupabaseTable;
        const isActive = setting ? setting.is_active : true; // Default to active if no setting

        return {
          name: bankName,
          supabaseTable: actualSupabaseTable,
          isActive: isActive,
          isLoading: isActive, // Only set isLoading true if initially active, data will be fetched
          isEditingTableName: false,
          tempSupabaseTable: actualSupabaseTable, // For the edit input
          lastModified: isActive ? undefined : "Inactive", // Mark inactive accounts
        };
      });
    }
    setBankAccounts(initialAccountsSetup);
    setIsInitialLoading(false);

    // Fetch details for initially active accounts
    for (const countryKey in initialAccountsSetup) {
      for (const account of initialAccountsSetup[countryKey]) {
        if (account.isActive) {
          fetchBankDetails(countryKey, account.name, account.supabaseTable);
        }
      }
    }
  };

  const fetchBankDetails = async (
    country: string,
    bankName: string,
    tableName: string,
  ) => {
    let lastModified: string | undefined;
    let latestEntry: any | undefined; // This will now hold an array of entries for the latest date
    let errorMsg: string | undefined;

    try {
      // 1. Get the most recent "Date" from the table
      const { data: maxDateData, error: maxDateError } = await supabase
        .from(tableName)
        .select('"Date"') // Select the "Date" column
        .order('"Date"', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (maxDateError) {
        console.error(
          `Error fetching max date for ${tableName}:`,
          maxDateError,
        );
        errorMsg = `Failed to get latest date: ${maxDateError.message}`;
        lastModified = "Error";
      } else if (maxDateData && maxDateData.Date) {
        const latestDateString = maxDateData.Date; // e.g., "2025-05-18"

        // Format the date for display. Adding T00:00:00Z ensures it's treated as UTC to avoid timezone shifts.
        const dateObj = new Date(latestDateString + "T00:00:00Z");
        lastModified = dateObj.toLocaleDateString(undefined, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        // 2. Get all entries for that latest date
        const { data: entriesForDate, error: entriesError } = await supabase
          .from(tableName)
          .select("*")
          .eq('"Date"', latestDateString); // Filter by the latest date string

        if (entriesError) {
          console.error(
            `Error fetching entries for date ${latestDateString} from ${tableName}:`,
            entriesError,
          );
          errorMsg =
            (errorMsg ? errorMsg + "; " : "") +
            `Failed to get entries: ${entriesError.message}`;
          latestEntry = null;
        } else {
          latestEntry = entriesForDate; // Assign the array of entries
          if (!entriesForDate || entriesForDate.length === 0) {
            // This case might occur if data consistency is off, or if the date was found but somehow no rows match.
            // Or if the table was emptied between the two queries.
            lastModified = `No entries for ${lastModified}`; // Append to the date
            latestEntry = null;
          }
        }
      } else {
        lastModified = "No entries yet";
        latestEntry = null;
      }
    } catch (e: any) {
      console.error(`Exception fetching data for ${tableName}:`, e);
      errorMsg = `Exception: ${e.message}`;
      lastModified = "Error";
      latestEntry = null;
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

  const handleToggleAccountStatus = async (
    country: string,
    bankName: string,
    newIsActiveStatus: boolean,
  ) => {
    if (!currentUser) {
      console.error("User not logged in. Cannot update status.");
      // TODO: Show message to user
      return;
    }

    // Optimistically update UI
    setBankAccounts((prev) => {
      const updatedCountryAccounts = prev[country].map((acc) =>
        acc.name === bankName
          ? {
              ...acc,
              isActive: newIsActiveStatus,
              isLoading: newIsActiveStatus, // Set loading if activating
              error: undefined, // Clear previous errors
              latestEntry: newIsActiveStatus ? acc.latestEntry : null, // Keep or clear entries
              lastModified: newIsActiveStatus ? acc.lastModified : "Inactive", // Keep or mark inactive
            }
          : acc,
      );
      return { ...prev, [country]: updatedCountryAccounts };
    });

    const { error } = await supabase
      .from("user_bank_settings")
      .upsert({
        user_id: currentUser.id,
        country: country,
        bank_name: bankName,
        is_active: newIsActiveStatus,
      })
      .select(); // .select() can help confirm the upsert and get back data if needed

    if (error) {
      console.error("Error updating account status in Supabase:", error);
      // Revert optimistic update
      setBankAccounts((prev) => {
        const revertedCountryAccounts = prev[country].map((acc) =>
          acc.name === bankName
            ? {
                ...acc,
                isActive: !newIsActiveStatus,
                isLoading: false,
                error: "Failed to save status",
              }
            : acc,
        );
        return { ...prev, [country]: revertedCountryAccounts };
      });
    } else {
      console.log(
        `Status for ${bankName} in ${country} updated to ${newIsActiveStatus}.`,
      );
      if (newIsActiveStatus) {
        const account = bankAccounts[country]?.find(
          (acc) => acc.name === bankName,
        );
        if (account && !account.latestEntry) {
          // Fetch only if activating and no data yet
          fetchBankDetails(country, bankName, account.supabaseTable);
        } else if (account) {
          // If already has data, just ensure loading is false
          setBankAccounts((prev) => ({
            ...prev,
            [country]: prev[country].map((a) =>
              a.name === bankName ? { ...a, isLoading: false } : a,
            ),
          }));
        }
      } else {
        // If deactivating, ensure isLoading is false and data is cleared (already handled by optimistic update)
        setBankAccounts((prev) => {
          const updatedCountryAccounts = prev[country].map((acc) =>
            acc.name === bankName
              ? {
                  ...acc,
                  isLoading: false,
                  latestEntry: null,
                  lastModified: "Inactive",
                  error: undefined,
                }
              : acc,
          );
          return { ...prev, [country]: updatedCountryAccounts };
        });
      }
    }
  };

  const handleEditTableName = (country: string, bankName: string) => {
    setBankAccounts((prev) => ({
      ...prev,
      [country]: prev[country].map((acc) =>
        acc.name === bankName
          ? {
              ...acc,
              isEditingTableName: true,
              tempSupabaseTable: acc.supabaseTable,
            }
          : acc,
      ),
    }));
  };

  const handleCancelEditTableName = (country: string, bankName: string) => {
    setBankAccounts((prev) => ({
      ...prev,
      [country]: prev[country].map((acc) =>
        acc.name === bankName
          ? {
              ...acc,
              isEditingTableName: false,
              tempSupabaseTable: acc.supabaseTable,
            }
          : acc,
      ),
    }));
  };

  const handleTableNameInputChange = (
    country: string,
    bankName: string,
    value: string,
  ) => {
    setBankAccounts((prev) => ({
      ...prev,
      [country]: prev[country].map((acc) =>
        acc.name === bankName ? { ...acc, tempSupabaseTable: value } : acc,
      ),
    }));
  };

  const handleSaveTableName = async (country: string, bankName: string) => {
    if (!currentUser) {
      console.error("User not logged in. Cannot save table name.");
      // TODO: Show message to user
      return;
    }
    const accountToUpdate = bankAccounts[country].find(
      (acc) => acc.name === bankName,
    );
    if (!accountToUpdate || !accountToUpdate.tempSupabaseTable) return;

    const newTableName = accountToUpdate.tempSupabaseTable;

    // Optimistically update the table name and set loading state
    setBankAccounts((prev) => ({
      ...prev,
      [country]: prev[country].map((acc) =>
        acc.name === bankName
          ? {
              ...acc,
              supabaseTable: newTableName, // This is the actual table name now
              isLoading: true,
              isEditingTableName: false,
              error: undefined,
            }
          : acc,
      ),
    }));

    const { error } = await supabase
      .from("user_bank_settings")
      .upsert({
        user_id: currentUser.id,
        country: country,
        bank_name: bankName,
        custom_supabase_table_name: newTableName,
      })
      .select(); // .select() can help confirm

    if (error) {
      console.error("Error saving custom table name to Supabase:", error);
      setBankAccounts((prev) => ({
        ...prev,
        [country]: prev[country].map((acc) =>
          acc.name === bankName
            ? {
                ...acc,
                supabaseTable: accountToUpdate.supabaseTable, // Revert to old actual table name
                tempSupabaseTable: accountToUpdate.supabaseTable, // Revert temp name
                isLoading: false,
                isEditingTableName: true, // Re-open edit
                error: "Failed to save table name",
              }
            : acc,
        ),
      }));
    } else {
      console.log(
        `Custom table name for ${bankName} in ${country} updated to ${newTableName}. Fetching new details.`,
      );
      await fetchBankDetails(country, bankName, newTableName);
    }
  };

  if (isInitialLoading && !currentUser) {
    // Show loading until user session is checked
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
              <Card
                key={account.name}
                className={`flex flex-col ${
                  !account.isActive ? "bg-transparent border border-black" : ""
                }`}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-start gap-2">
                    <span className={account.isActive ? "" : "text-gray-500"}>
                      {account.name}
                    </span>
                    {!account.isEditingTableName && (
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={account.isActive ? "outline" : "inactive"}
                          className="whitespace-nowrap"
                        >
                          {account.supabaseTable}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleEditTableName(country, account.name)
                          }
                          aria-label="Edit table name"
                        >
                          ✏️
                        </Button>
                      </div>
                    )}
                  </CardTitle>
                  {account.isEditingTableName && (
                    <div className="mt-2 space-y-2">
                      <Label
                        htmlFor={`table-name-input-${country}-${account.name}`}
                        className="text-xs"
                      >
                        Edit Supabase Table Name:
                      </Label>
                      <Input
                        id={`table-name-input-${country}-${account.name}`}
                        value={account.tempSupabaseTable}
                        onChange={(e) =>
                          handleTableNameInputChange(
                            country,
                            account.name,
                            e.target.value,
                          )
                        }
                        placeholder="e.g., transactions_custom_name"
                        className="h-8 text-sm"
                      />
                      <div className="flex justify-end space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleCancelEditTableName(country, account.name)
                          }
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() =>
                            handleSaveTableName(country, account.name)
                          }
                        >
                          Save
                        </Button>
                      </div>
                    </div>
                  )}
                  <CardDescription className="mt-1">
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
                          id={`switch-${country}-${account.name.replace(
                            /\s+/g,
                            "-",
                          )}`}
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
                          htmlFor={`switch-${country}-${account.name.replace(
                            /\s+/g,
                            "-",
                          )}`}
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
