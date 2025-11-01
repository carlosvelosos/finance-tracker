"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Switch } from "@/components/ui/switch";
import {
  Loader2,
  Mail,
  User,
  Users,
  Calendar,
  AlertCircle,
  Filter,
  BarChart3,
  TrendingUp,
  Building2,
  CreditCard,
  Banknote,
  Download,
  Upload,
  FileText,
  X,
  Zap,
  Info,
  CheckCircle2,
} from "lucide-react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer } from "recharts";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

interface EmailData {
  id: string;
  snippet: string;
  payload?: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: EmailPart[];
  };
  headers?: { name: string; value: string }[]; // Alternative location for headers (in stored files)
  date?: string; // Date field (in stored files)
  from?: string; // From field (in stored files)
  subject?: string; // Subject field (in stored files)
  to?: string; // To field (in stored files)
  ignored?: boolean; // Optional flag to mark emails as ignored
}

interface EmailPart {
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; size?: number };
  parts?: EmailPart[];
}

interface TokenResponse {
  access_token: string;
}

interface UserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

interface GoogleAPI {
  load: (
    api: string,
    options: { callback: () => void; onerror: () => void },
  ) => void;
  client: {
    init: (config: {
      apiKey: string;
      discoveryDocs: string[];
    }) => Promise<void>;
    gmail: {
      users: {
        messages: {
          list: (params: {
            userId: string;
            maxResults: number;
            q?: string;
          }) => Promise<{ result: { messages?: { id: string }[] } }>;
          get: (params: {
            userId: string;
            id: string;
            format?: string;
          }) => Promise<{ result: EmailData }>;
        };
        getProfile: (params: {
          userId: string;
        }) => Promise<{ result: { emailAddress: string } }>;
      };
    };
    setToken: (token: { access_token: string } | null) => void;
    getToken: () => { access_token: string } | null;
  };
}

interface GoogleAuth {
  accounts: {
    oauth2: {
      initTokenClient: (config: {
        client_id: string;
        scope: string;
        callback: (response: TokenResponse) => void;
        error_callback: (error: { type: string }) => void;
      }) => {
        requestAccessToken: (options: { prompt: string }) => void;
      };
      revoke: (token: string) => void;
    };
  };
}

declare global {
  interface Window {
    google: GoogleAuth;
    gapi: GoogleAPI;
  }
}

const EmailClient = () => {
  const [emails, setEmails] = useState<EmailData[]>([]);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [fetchTime, setFetchTime] = useState<number | null>(null);
  const [cacheAge, setCacheAge] = useState<Date | null>(null);
  const [isLoadingFromCache, setIsLoadingFromCache] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [storageInfo, setStorageInfo] = useState<{
    size: number;
    quota: number;
  } | null>(null);
  const [showAllSenders, setShowAllSenders] = useState(false);
  const [showAllUploadSenders, setShowAllUploadSenders] = useState(false); // Separate state for upload filtering
  const [selectedSenders] = useState<string[]>([
    "Inter",
    "Handelsbanken",
    "SJ Prio Mastercard",
    "American Express",
    "Clear",
    "Rico",
    "Cartões Riachuelo",
  ]);
  const [institutionEmailCounts, setInstitutionEmailCounts] = useState<
    Record<string, number>
  >({});
  const [expandedEmails, setExpandedEmails] = useState<Set<string>>(new Set());
  const [exportStartDate, setExportStartDate] = useState<string>("");
  const [exportEndDate, setExportEndDate] = useState<string>("");

  // Date navigation state
  const [selectedDateFilter, setSelectedDateFilter] = useState<{
    type: "all" | "day" | "week" | "month";
    value?: string; // ISO date string for day, "YYYY-Www" for week, "YYYY-MM" for month
  }>({ type: "all" });
  const [expandedMonths, setExpandedMonths] = useState<string[]>([]);
  const [expandedWeeks, setExpandedWeeks] = useState<string[]>([]);

  // Sender navigation state
  const [selectedSenderFilter, setSelectedSenderFilter] =
    useState<string>("all");
  const [expandedDomains, setExpandedDomains] = useState<string[]>([]);

  // Ignored emails state
  const [ignoredEmails, setIgnoredEmails] = useState<Set<string>>(new Set());
  const [hideIgnored, setHideIgnored] = useState(false); // Toggle for Recent Emails section
  const [hideIgnoredBySender, setHideIgnoredBySender] = useState(false); // Toggle for Emails by Sender section

  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<{
    currentWeek: string;
    weekProgress: number;
    totalWeeks: number;
    completedWeeks: number;
    totalEmails: number;
    processedEmails: number;
    currentStep: string;
  }>({
    currentWeek: "",
    weekProgress: 0,
    totalWeeks: 0,
    completedWeeks: 0,
    totalEmails: 0,
    processedEmails: 0,
    currentStep: "",
  });
  const [dataSource, setDataSource] = useState<"fetch" | "upload">("fetch");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isProcessingUpload, setIsProcessingUpload] = useState(false);
  const [originalUploadedEmails, setOriginalUploadedEmails] = useState<
    EmailData[]
  >([]);
  const [offlineMode, setOfflineMode] = useState(false);

  // Smart Fetching state
  const [emailCacheInfo, setEmailCacheInfo] = useState<{
    latestFile: string | null;
    latestEmailDate: Date | null;
    totalFiles: number;
    scanning: boolean;
    error: string | null;
    needsMigration: boolean;
  } | null>(null);
  const [isSmartFetching, setIsSmartFetching] = useState(false);
  const [smartFetchLogs, setSmartFetchLogs] = useState<
    {
      timestamp: string;
      message: string;
      type: "info" | "success" | "warning" | "error";
    }[]
  >([]);
  const [showSmartFetchConsole, setShowSmartFetchConsole] = useState(false);
  const [needsMigration, setNeedsMigration] = useState(false);
  const [isMigrating, setIsMigrating] = useState(false);

  const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
  const API_KEY = process.env.NEXT_PUBLIC_GOOGLE_API_KEY;
  const DISCOVERY_DOC =
    "https://www.googleapis.com/discovery/v1/apis/gmail/v1/rest";
  const SCOPES =
    "https://www.googleapis.com/auth/gmail.readonly https://www.googleapis.com/auth/userinfo.profile";

  // Check for required environment variables
  useEffect(() => {
    if (!CLIENT_ID || !API_KEY) {
      setError(
        "Missing Google API credentials. Please check your environment variables.",
      );
    }
  }, [CLIENT_ID, API_KEY]);

  // Helper function to safely set localStorage with error handling
  const safeSetLocalStorage = (key: string, value: string): boolean => {
    try {
      localStorage.setItem(key, value);
      return true;
    } catch (error) {
      if (error instanceof Error && error.name === "QuotaExceededError") {
        console.warn("localStorage quota exceeded, unable to cache data");
        setError("Storage quota exceeded. Data loaded but not cached locally.");
      } else {
        console.error("Error saving to localStorage:", error);
      }
      return false;
    }
  };
  useEffect(() => {
    // Skip Google API initialization in offline mode
    if (offlineMode) {
      setIsCheckingAuth(false);
      return;
    }

    initializeGapi();
    loadCachedEmails();
    updateStorageInfo();
    checkExistingAuth(); // Check for existing authentication
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [offlineMode]);

  // Background scan email directory on mount
  useEffect(() => {
    scanEmailCache();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Function to scan email cache in background
  const scanEmailCache = async () => {
    try {
      setEmailCacheInfo({
        latestFile: null,
        latestEmailDate: null,
        totalFiles: 0,
        scanning: true,
        error: null,
        needsMigration: false,
      });

      const response = await fetch("/api/smart-fetch/scan");
      if (!response.ok) {
        throw new Error("Failed to scan email cache");
      }

      const data = await response.json();

      setEmailCacheInfo({
        latestFile: data.latestFile,
        latestEmailDate: data.latestEmailDate
          ? new Date(data.latestEmailDate)
          : null,
        totalFiles: data.totalFiles,
        scanning: false,
        error: null,
        needsMigration: data.needsMigration,
      });

      setNeedsMigration(data.needsMigration);
    } catch (error) {
      console.error("Error scanning email cache:", error);
      setEmailCacheInfo({
        latestFile: null,
        latestEmailDate: null,
        totalFiles: 0,
        scanning: false,
        error: error instanceof Error ? error.message : "Unknown error",
        needsMigration: false,
      });
    }
  };
  const initializeGapi = useCallback(async () => {
    try {
      console.log("Initializing Google APIs...");

      // Check for required credentials first
      if (!CLIENT_ID || !API_KEY) {
        throw new Error(
          "Missing Google API credentials. Please check your environment variables.",
        );
      }

      // Load Google Identity Services script
      if (!document.getElementById("google-identity-services")) {
        const script = document.createElement("script");
        script.id = "google-identity-services";
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Load Google API loader
      if (!window.gapi) {
        const script = document.createElement("script");
        script.src = "https://apis.google.com/js/api.js";
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        await new Promise((resolve) => {
          script.onload = resolve;
        });
      }

      // Initialize gapi
      await new Promise<void>((resolve, reject) => {
        window.gapi.load("client", {
          callback: async () => {
            try {
              await window.gapi.client.init({
                apiKey: API_KEY,
                discoveryDocs: [DISCOVERY_DOC],
              });
              console.log("Google API client initialized successfully");
              resolve();
            } catch (error) {
              console.error("Error initializing gapi client:", error);
              reject(error);
            }
          },
          onerror: () => {
            reject(new Error("Failed to load gapi client"));
          },
        });
      });
    } catch (error) {
      console.error("Error initializing Google APIs:", error);
      setError(
        `Failed to initialize Google APIs: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadCachedEmails = async () => {
    try {
      setIsLoadingFromCache(true);
      const cachedData = localStorage.getItem("gmail-client-cache");

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        const cacheTimestamp = new Date(parsed.timestamp);
        const now = new Date();
        const ageInMinutes =
          (now.getTime() - cacheTimestamp.getTime()) / (1000 * 60);

        // Load cache if it's less than 30 minutes old
        if (ageInMinutes < 30) {
          setEmails(parsed.emails);
          setFetchTime(parsed.fetchTime);
          setCacheAge(cacheTimestamp);
          console.log(
            `Loaded ${parsed.emails.length} emails from cache (${ageInMinutes.toFixed(1)} minutes old)`,
          );
        } else {
          console.log("Cache expired, will fetch fresh data");
          localStorage.removeItem("gmail-client-cache");
        }
      }
    } catch (error) {
      console.error("Error loading cached emails:", error);
      localStorage.removeItem("gmail-client-cache");
    } finally {
      setIsLoadingFromCache(false);
    }
  };
  const saveCachedEmails = (emailsData: EmailData[], fetchDuration: number) => {
    try {
      // Create minimal cache data to reduce storage size
      const minimalEmails = emailsData.map((email) => ({
        id: email.id,
        snippet: email.snippet.substring(0, 200), // Truncate snippet to 200 chars
        payload: {
          headers: getEmailHeaders(email).filter((h) =>
            ["From", "Subject", "Date"].includes(h.name),
          ), // Only keep essential headers
        },
      }));

      const cacheData = {
        emails: minimalEmails,
        fetchTime: fetchDuration,
        timestamp: new Date().toISOString(),
        version: "1.1",
        count: emailsData.length,
      };

      const cacheString = JSON.stringify(cacheData);
      const sizeInMB = new Blob([cacheString]).size / (1024 * 1024);

      console.log(
        `Attempting to cache ${emailsData.length} emails (${sizeInMB.toFixed(2)} MB)`,
      );

      // Check if cache size is reasonable (< 5MB)
      if (sizeInMB > 5) {
        console.warn("Cache size too large, reducing data...");
        // Further reduce data if still too large
        const reducedEmails = minimalEmails.slice(0, 50).map((email) => ({
          id: email.id,
          snippet: email.snippet.substring(0, 100),
          payload: {
            headers: getEmailHeaders(email).slice(0, 3),
          },
        }));

        const reducedCacheData = {
          ...cacheData,
          emails: reducedEmails,
          note: "Reduced dataset due to size constraints",
        };
        safeSetLocalStorage(
          "gmail-client-cache",
          JSON.stringify(reducedCacheData),
        );
        console.log(`Cached reduced dataset: ${reducedEmails.length} emails`);
      } else {
        localStorage.setItem("gmail-client-cache", JSON.stringify(cacheData));
        console.log(`Cached ${emailsData.length} emails to localStorage`);
      } // Set full emails in state regardless of what we cached
      setEmails(emailsData);
      setCacheAge(new Date());
      updateStorageInfo();
    } catch (error) {
      console.error("Error saving emails to cache:", error);

      if (error instanceof Error && error.name === "QuotaExceededError") {
        // Clear old cache and try with minimal data
        try {
          localStorage.removeItem("gmail-client-cache");
          console.log(
            "Cleared cache due to quota exceeded, trying minimal cache...",
          );

          // Try with just the most recent 20 emails and minimal data
          const minimalCache = {
            emails: emailsData.slice(0, 20).map((email) => ({
              id: email.id,
              snippet: email.snippet.substring(0, 50),
              payload: {
                headers: getEmailHeaders(email)
                  .filter((h) => h.name === "From" || h.name === "Subject")
                  .slice(0, 2),
              },
            })),
            fetchTime: fetchDuration,
            timestamp: new Date().toISOString(),
            version: "1.1-minimal",
            note: "Minimal cache due to storage constraints",
          };

          localStorage.setItem(
            "gmail-client-cache",
            JSON.stringify(minimalCache),
          );
          setCacheAge(new Date());
          console.log("Successfully saved minimal cache");
        } catch (fallbackError) {
          console.error("Failed to save even minimal cache:", fallbackError);
          // Show user-friendly error
          setError("Storage quota exceeded. Cache disabled for this session.");
        }
      }
    }
  };
  const clearCache = () => {
    try {
      localStorage.removeItem("gmail-client-cache");
      setCacheAge(null);
      updateStorageInfo();
      console.log("Cache cleared");
    } catch (error) {
      console.error("Error clearing cache:", error);
    }
  };

  const updateStorageInfo = async () => {
    try {
      if ("storage" in navigator && "estimate" in navigator.storage) {
        const estimate = await navigator.storage.estimate();
        if (estimate.usage !== undefined && estimate.quota !== undefined) {
          setStorageInfo({
            size: estimate.usage,
            quota: estimate.quota,
          });
        }
      }
    } catch (error) {
      console.error("Error getting storage info:", error);
    }
  };

  // Authentication persistence functions
  const saveAuthData = (tokenResponse: TokenResponse, userInfo: UserInfo) => {
    try {
      const authData = {
        access_token: tokenResponse.access_token,
        userInfo: userInfo,
        timestamp: new Date().toISOString(),
        expiresAt: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      };
      localStorage.setItem("gmail-auth", JSON.stringify(authData));
      console.log("Authentication data saved");
    } catch (error) {
      console.error("Error saving auth data:", error);
    }
  };

  const loadAuthData = () => {
    try {
      const authDataString = localStorage.getItem("gmail-auth");
      if (!authDataString) return null;

      const authData = JSON.parse(authDataString);
      const now = new Date();
      const expiresAt = new Date(authData.expiresAt);

      // Check if token is still valid (within 10 minutes)
      if (now > expiresAt) {
        console.log("Stored authentication expired, removing...");
        localStorage.removeItem("gmail-auth");
        return null;
      }

      return authData;
    } catch (error) {
      console.error("Error loading auth data:", error);
      localStorage.removeItem("gmail-auth");
      return null;
    }
  };

  const clearAuthData = () => {
    try {
      localStorage.removeItem("gmail-auth");
      console.log("Authentication data cleared");
    } catch (error) {
      console.error("Error clearing auth data:", error);
    }
  };
  const checkExistingAuth = useCallback(async () => {
    try {
      setIsCheckingAuth(true);
      const authData = loadAuthData();
      if (!authData) {
        console.log("No valid stored authentication found");
        setIsCheckingAuth(false);
        return;
      }

      console.log(
        "Found valid stored authentication, attempting to restore session...",
      );

      // Wait for gapi to be initialized
      let attempts = 0;
      while (
        (!window.gapi?.client || !window.gapi?.client?.gmail) &&
        attempts < 50
      ) {
        await new Promise((resolve) => setTimeout(resolve, 100));
        attempts++;
      }

      if (!window.gapi?.client?.gmail) {
        console.log("Gmail API not ready, clearing stored auth");
        clearAuthData();
        setIsCheckingAuth(false);
        return;
      }

      // Set the stored token
      window.gapi.client.setToken({
        access_token: authData.access_token,
      });

      // Verify the token is still valid by making a simple API call
      try {
        await window.gapi.client.gmail.users.getProfile({
          userId: "me",
        });

        // Token is valid, restore the session
        setIsSignedIn(true);
        setUserInfo(authData.userInfo);
        console.log("Session restored successfully");

        // Optionally fetch emails if not loading from cache
        if (!isLoadingFromCache) {
          await fetchEmails();
        }
      } catch {
        console.log("Stored token is invalid, clearing stored auth");
        clearAuthData();
        window.gapi.client.setToken(null);
      }
    } catch (error) {
      console.error("Error checking existing auth:", error);
      clearAuthData();
    } finally {
      setIsCheckingAuth(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const handleSignIn = async () => {
    try {
      setLoading(true);
      setError("");
      console.log("Starting sign-in process...");

      // Check for required credentials first
      if (!CLIENT_ID || !API_KEY) {
        throw new Error(
          "Missing Google API credentials. Please check your environment variables.",
        );
      }

      if (!window.google?.accounts?.oauth2) {
        throw new Error("Google Identity Services not loaded");
      }

      const tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: async (tokenResponse: TokenResponse) => {
          try {
            console.log("Token received:", tokenResponse);

            // Validate token response
            if (!tokenResponse.access_token) {
              throw new Error("No access token received from Google");
            }

            // Ensure gapi client is ready
            if (!window.gapi?.client) {
              throw new Error("Google API client not initialized");
            }

            // Set the access token for gapi
            window.gapi.client.setToken({
              access_token: tokenResponse.access_token,
            });
            console.log("Access token set successfully");
            setIsSignedIn(true);

            // Get user info
            const userInfo = await getUserInfo(tokenResponse.access_token);

            // Save authentication data for persistence
            if (userInfo) {
              saveAuthData(tokenResponse, userInfo);
            }

            // Wait a moment to ensure token is fully set
            await new Promise((resolve) => setTimeout(resolve, 500));

            // Fetch emails
            await fetchEmails();
          } catch (error) {
            console.error("Error in token callback:", error);
            setError(
              `Authentication failed: ${error instanceof Error ? error.message : "Unknown error"}`,
            );
          } finally {
            setLoading(false);
          }
        },
        error_callback: (error: { type?: string; error?: string }) => {
          console.error("OAuth error:", error);
          setError(
            `OAuth error: ${error.type || error.error || "Unknown error"}`,
          );
          setLoading(false);
        },
      });

      tokenClient.requestAccessToken({ prompt: "consent" });
    } catch (error) {
      console.error("Sign-in error:", error);
      setError(
        `Sign-in failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setLoading(false);
    }
  };
  const getUserInfo = async (accessToken: string): Promise<UserInfo | null> => {
    try {
      const response = await fetch(
        "https://www.googleapis.com/oauth2/v2/userinfo",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        },
      );

      if (response.ok) {
        const userInfo: UserInfo = await response.json();
        setUserInfo(userInfo);
        console.log("User info:", userInfo);
        return userInfo;
      }
    } catch (error) {
      console.error("Error fetching user info:", error);
    }
    return null;
  };
  const fetchEmails = async () => {
    try {
      setLoading(true);
      setError(""); // Clear previous errors
      const startTime = performance.now();
      console.log("Fetching emails...");

      // Check for required credentials first
      if (!CLIENT_ID || !API_KEY) {
        throw new Error(
          "Missing Google API credentials. Please check your environment variables.",
        );
      }

      // Check if gapi is loaded and client is initialized
      if (!window.gapi?.client?.gmail) {
        throw new Error(
          "Gmail API client not initialized. Please try signing in again.",
        );
      }

      // Check if user has a valid token
      const token = window.gapi.client.getToken();
      if (!token?.access_token) {
        throw new Error("No valid access token found. Please sign in again.");
      }

      console.log("Making Gmail API request...");
      const response = await window.gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: 50,
      });

      console.log("Messages list response:", response);

      if (!response.result) {
        throw new Error("Invalid response from Gmail API");
      }

      if (!response.result.messages || response.result.messages.length === 0) {
        console.log("No messages found in Gmail");
        setEmails([]);
        setFetchTime(performance.now() - startTime);
        return;
      }
      console.log(
        `Found ${response.result.messages.length} messages, fetching details...`,
      );

      // Implement batched email fetching to prevent rate limiting
      const batchSize = 10; // Process 10 emails at a time
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const allEmailResults: (EmailData | null)[] = [];

      for (let i = 0; i < response.result.messages.length; i += batchSize) {
        const batch = response.result.messages.slice(i, i + batchSize);
        console.log(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(response.result.messages.length / batchSize)}`,
        );

        const emailPromises = batch.map(async (message: { id: string }) => {
          try {
            const emailResponse =
              await window.gapi.client.gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full", // Ensure we get full message data
              });

            // Validate that we have a proper response
            if (!emailResponse?.result) {
              console.warn(`No result for email ${message.id}`);
              return null;
            }

            return emailResponse.result;
          } catch (emailError) {
            console.error(`Error fetching email ${message.id}:`, emailError);
            return null; // Return null for failed emails
          }
        });

        const batchResults = await Promise.all(emailPromises);
        allEmailResults.push(...batchResults);

        // Add a small delay between batches to respect rate limits
        if (i + batchSize < response.result.messages.length) {
          await delay(200); // 200ms delay between batches
        }
      }
      const emailsData = allEmailResults.filter(
        (email): email is EmailData => email !== null,
      );
      const endTime = performance.now();
      const fetchDuration = endTime - startTime;

      console.log(`Successfully fetched ${emailsData.length} emails`);
      setEmails(emailsData);
      setFetchTime(fetchDuration);

      // Save to cache
      saveCachedEmails(emailsData, fetchDuration);

      console.log("Emails fetched:", emailsData);
      console.log(`Fetch completed in ${fetchDuration.toFixed(2)}ms`);
    } catch (error) {
      console.error("Error fetching emails:", error);
      // Better error message based on error type
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (typeof error === "object" && error !== null) {
        // Handle GAPI error objects
        const errorObj = error as {
          result?: { error?: { message?: string; code?: number } };
          status?: number;
          statusText?: string;
        };
        if (errorObj.result?.error) {
          const apiError = errorObj.result.error;
          errorMessage = `Gmail API Error: ${apiError.message || apiError.code || "Unknown API error"}`;

          // Handle specific Google API error codes
          if (apiError.code === 401) {
            errorMessage = "Authentication expired. Please sign in again.";
          } else if (apiError.code === 403) {
            errorMessage =
              "Access denied. Please check your Gmail API permissions.";
          } else if (apiError.code === 429) {
            errorMessage = "Rate limit exceeded. Please try again later.";
          }
        } else if (errorObj.status && errorObj.statusText) {
          errorMessage = `HTTP Error ${errorObj.status}: ${errorObj.statusText}`;
        } else if (Object.keys(errorObj).length === 0) {
          // Handle empty error objects
          errorMessage =
            "Empty error object received. This might indicate a network issue or missing credentials.";
        } else {
          errorMessage = `Error details: ${JSON.stringify(error)}`;
        }
      } else if (error === null || error === undefined) {
        errorMessage =
          "Null or undefined error. This might indicate a configuration issue.";
      }

      // Add additional context for debugging
      console.error("Detailed error analysis:", {
        errorType: typeof error,
        errorConstructor: error?.constructor?.name,
        hasGapi: !!window.gapi,
        hasGmailClient: !!window.gapi?.client?.gmail,
        hasToken: !!window.gapi?.client?.getToken(),
        clientId: CLIENT_ID ? "present" : "missing",
        apiKey: API_KEY ? "present" : "missing",
      });

      setError(`Failed to fetch emails: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      // Revoke the token
      const token = window.gapi.client.getToken();
      if (token) {
        window.google.accounts.oauth2.revoke(token.access_token);
        window.gapi.client.setToken(null);
      }
      setIsSignedIn(false);
      setEmails([]);
      setUserInfo(null);
      setError("");
      setFetchTime(null);
      setCacheAge(null);
      clearCache();
      clearAuthData(); // Clear stored authentication data
      console.log("User signed out");
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const getHeader = (
    headers: { name: string; value: string }[],
    name: string,
  ) => {
    const header = headers.find(
      (h) => h.name.toLowerCase() === name.toLowerCase(),
    );
    return header?.value || "";
  };

  // Helper function to safely get headers from email (handles both API and stored formats)
  const getEmailHeaders = (
    email: EmailData,
  ): { name: string; value: string }[] => {
    return email.payload?.headers || email.headers || [];
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const weekday = date.toLocaleDateString("en-US", { weekday: "short" });
      const formattedDateTime = date.toLocaleString();
      return `${weekday} ${formattedDateTime}`;
    } catch {
      return dateString;
    }
  };

  // Helper function to get ISO week number
  const getWeekNumber = useCallback((date: Date): number => {
    const d = new Date(
      Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()),
    );
    const dayNum = d.getUTCDay() || 7;
    d.setUTCDate(d.getUTCDate() + 4 - dayNum);
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    return Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
  }, []);

  // Helper function to get week identifier (YYYY-Www)
  const getWeekIdentifier = useCallback(
    (date: Date): string => {
      const weekNum = getWeekNumber(date);
      return `${date.getFullYear()}-W${weekNum.toString().padStart(2, "0")}`;
    },
    [getWeekNumber],
  );

  // Helper function to get month identifier (YYYY-MM)
  const getMonthIdentifier = useCallback((date: Date): string => {
    return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`;
  }, []);

  // Helper function to get date identifier (YYYY-MM-DD)
  const getDateIdentifier = useCallback((date: Date): string => {
    return date.toISOString().split("T")[0];
  }, []);

  // Memoized function to organize emails by date hierarchy
  const emailsByDateHierarchy = useMemo(() => {
    const hierarchy: {
      [year: string]: {
        [month: string]: {
          [week: string]: {
            [day: string]: EmailData[];
          };
        };
      };
    } = {};

    // Filter emails based on hideIgnored flag
    const emailsToOrganize = hideIgnored
      ? emails.filter((email) => !ignoredEmails.has(email.id))
      : emails;

    emailsToOrganize.forEach((email) => {
      const dateHeader = getHeader(getEmailHeaders(email), "Date");
      if (!dateHeader) return;

      try {
        const date = new Date(dateHeader);
        const year = date.getFullYear().toString();
        const month = getMonthIdentifier(date);
        const week = getWeekIdentifier(date);
        const day = getDateIdentifier(date);

        if (!hierarchy[year]) hierarchy[year] = {};
        if (!hierarchy[year][month]) hierarchy[year][month] = {};
        if (!hierarchy[year][month][week]) hierarchy[year][month][week] = {};
        if (!hierarchy[year][month][week][day])
          hierarchy[year][month][week][day] = [];

        hierarchy[year][month][week][day].push(email);
      } catch (error) {
        console.warn("Invalid date format:", dateHeader, error);
      }
    });

    return hierarchy;
  }, [
    emails,
    hideIgnored,
    ignoredEmails,
    getMonthIdentifier,
    getWeekIdentifier,
    getDateIdentifier,
  ]);

  // Memoized function to filter emails based on selected date filter
  const filteredEmailsByDate = useMemo(() => {
    let filtered = emails;

    // Apply date filter
    if (selectedDateFilter.type !== "all") {
      filtered = filtered.filter((email) => {
        const dateHeader = getHeader(getEmailHeaders(email), "Date");
        if (!dateHeader) return false;

        try {
          const date = new Date(dateHeader);

          switch (selectedDateFilter.type) {
            case "day":
              return getDateIdentifier(date) === selectedDateFilter.value;
            case "week":
              return getWeekIdentifier(date) === selectedDateFilter.value;
            case "month":
              return getMonthIdentifier(date) === selectedDateFilter.value;
            default:
              return true;
          }
        } catch {
          return false;
        }
      });
    }

    // Apply ignored filter
    if (hideIgnored) {
      filtered = filtered.filter((email) => !ignoredEmails.has(email.id));
    }

    return filtered;
  }, [
    emails,
    selectedDateFilter,
    hideIgnored,
    ignoredEmails,
    getDateIdentifier,
    getWeekIdentifier,
    getMonthIdentifier,
  ]);

  // Memoized function to organize emails by sender domain and then by sender
  const emailsBySender = useMemo(() => {
    const domainMap: Record<
      string,
      Record<string, { emails: EmailData[]; fullEmail: string }>
    > = {};

    // Filter emails based on hideIgnoredBySender flag
    const emailsToOrganize = hideIgnoredBySender
      ? emails.filter((email) => !ignoredEmails.has(email.id))
      : emails;

    emailsToOrganize.forEach((email) => {
      const fromHeader = getHeader(getEmailHeaders(email), "From");
      if (!fromHeader) return;

      // Extract email address
      const senderEmail = fromHeader.match(/<(.+?)>/)
        ? fromHeader.match(/<(.+?)>/)![1]
        : fromHeader;

      // Extract domain and username
      const emailParts = senderEmail.match(/^(.+)@(.+)$/);
      if (!emailParts) return;

      const username = emailParts[1];
      const domain = emailParts[2];

      if (!domainMap[domain]) {
        domainMap[domain] = {};
      }
      if (!domainMap[domain][username]) {
        domainMap[domain][username] = { emails: [], fullEmail: senderEmail };
      }
      domainMap[domain][username].emails.push(email);
    });

    // Convert to array and sort domains by total email count (ascending)
    return Object.entries(domainMap)
      .map(([domain, senders]) => {
        const totalEmails = Object.values(senders).reduce(
          (sum, sender) => sum + sender.emails.length,
          0,
        );
        const sendersArray = Object.entries(senders)
          .sort(([, a], [, b]) => a.emails.length - b.emails.length)
          .map(([username, data]) => ({
            username,
            fullEmail: data.fullEmail,
            emails: data.emails,
            count: data.emails.length,
          }));
        return { domain, senders: sendersArray, totalCount: totalEmails };
      })
      .sort((a, b) => a.totalCount - b.totalCount);
  }, [emails, hideIgnoredBySender, ignoredEmails]);

  // Memoized function to filter emails based on selected sender
  const filteredEmailsBySender = useMemo(() => {
    let filtered = emails;

    // Apply sender filter (selectedSenderFilter now stores full email)
    if (selectedSenderFilter !== "all") {
      filtered = filtered.filter((email) => {
        const fromHeader = getHeader(getEmailHeaders(email), "From");
        if (!fromHeader) return false;

        const senderEmail = fromHeader.match(/<(.+?)>/)
          ? fromHeader.match(/<(.+?)>/)![1]
          : fromHeader;

        return senderEmail === selectedSenderFilter;
      });
    }

    // Apply ignored filter
    if (hideIgnoredBySender) {
      filtered = filtered.filter((email) => !ignoredEmails.has(email.id));
    }

    return filtered;
  }, [emails, selectedSenderFilter, hideIgnoredBySender, ignoredEmails]);

  // Function to get the number of emails to show for each institution
  const getEmailsToShow = (organization: string) => {
    return institutionEmailCounts[organization] || 5;
  };

  // Function to show more emails for a specific institution
  const showMoreEmails = (organization: string, totalEmails: number) => {
    const currentShowing = getEmailsToShow(organization);
    const nextShow = Math.min(currentShowing + 5, totalEmails);
    setInstitutionEmailCounts((prev) => ({
      ...prev,
      [organization]: nextShow,
    }));
  }; // Function to show fewer emails for a specific institution
  const showFewerEmails = (organization: string) => {
    setInstitutionEmailCounts((prev) => ({
      ...prev,
      [organization]: 5,
    }));
  };
  // Memoized function to toggle email snippet expansion
  const toggleEmailExpansion = useCallback((emailId: string) => {
    setExpandedEmails((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(emailId)) {
        newSet.delete(emailId);
      } else {
        newSet.add(emailId);
      }
      return newSet;
    });
  }, []);

  // Function to toggle email ignored status
  const toggleEmailIgnored = useCallback(
    (emailId: string) => {
      setIgnoredEmails((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(emailId)) {
          newSet.delete(emailId);
        } else {
          newSet.add(emailId);
        }
        return newSet;
      });

      // Also update the email object in the emails array
      setEmails((prevEmails) =>
        prevEmails.map((email) =>
          email.id === emailId ? { ...email, ignored: !email.ignored } : email,
        ),
      );

      // Update originalUploadedEmails if in upload mode
      if (dataSource === "upload") {
        setOriginalUploadedEmails((prevEmails) =>
          prevEmails.map((email) =>
            email.id === emailId
              ? { ...email, ignored: !email.ignored }
              : email,
          ),
        );
      }
    },
    [dataSource],
  );

  // Function to fetch and export emails for a specific date range with weekly batching
  const exportEmailsForDateRange = async () => {
    if (!exportStartDate || !exportEndDate) {
      setError("Please select both start and end dates for export");
      return;
    }

    if (new Date(exportStartDate) > new Date(exportEndDate)) {
      setError("Start date must be before end date");
      return;
    }

    try {
      setIsExporting(true);
      setError("");

      // Reset progress state
      setExportProgress({
        currentWeek: "",
        weekProgress: 0,
        totalWeeks: 0,
        completedWeeks: 0,
        totalEmails: 0,
        processedEmails: 0,
        currentStep: "Initializing...",
      });

      console.log(
        `Fetching emails from ${exportStartDate} to ${exportEndDate}...`,
      );

      // Check if gapi is loaded and client is initialized
      if (!window.gapi?.client?.gmail) {
        throw new Error(
          "Gmail API client not initialized. Please try signing in again.",
        );
      }

      // Check if user has a valid token
      const token = window.gapi.client.getToken();
      if (!token?.access_token) {
        throw new Error("No valid access token found. Please sign in again.");
      }

      // Calculate weekly intervals
      const startDateObj = new Date(exportStartDate);
      const endDateObj = new Date(exportEndDate);
      const weeklyIntervals: { start: Date; end: Date; label: string }[] = [];
      const currentWeekStart = new Date(startDateObj);

      while (currentWeekStart <= endDateObj) {
        const currentWeekEnd = new Date(currentWeekStart);
        currentWeekEnd.setDate(currentWeekEnd.getDate() + 6);

        // Don't go beyond the end date
        if (currentWeekEnd > endDateObj) {
          currentWeekEnd.setTime(endDateObj.getTime());
        }

        const weekLabel = `${currentWeekStart.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })} - ${currentWeekEnd.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        })}`;

        weeklyIntervals.push({
          start: new Date(currentWeekStart),
          end: new Date(currentWeekEnd),
          label: weekLabel,
        });

        // Move to next week
        currentWeekStart.setDate(currentWeekStart.getDate() + 7);
      }

      // Update progress with total weeks
      setExportProgress((prev) => ({
        ...prev,
        totalWeeks: weeklyIntervals.length,
        currentStep: `Processing ${weeklyIntervals.length} weekly intervals`,
      }));

      console.log(`Processing ${weeklyIntervals.length} weekly intervals`);

      // Format dates for Gmail search (YYYY/MM/DD)
      const formatGmailDate = (date: Date) => {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
      };

      const allEmailResults: EmailData[] = [];
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));

      // Process each week
      for (let weekIndex = 0; weekIndex < weeklyIntervals.length; weekIndex++) {
        const week = weeklyIntervals[weekIndex];

        // Update progress for current week
        setExportProgress((prev) => ({
          ...prev,
          currentWeek: week.label,
          completedWeeks: weekIndex,
          weekProgress: 0,
          currentStep: `Fetching emails for ${week.label}`,
        }));

        console.log(
          `Processing week ${weekIndex + 1}/${weeklyIntervals.length}: ${week.label}`,
        );

        try {
          // Create search query for this week
          const searchQuery = `after:${formatGmailDate(week.start)} before:${formatGmailDate(new Date(week.end.getTime() + 24 * 60 * 60 * 1000))}`;

          // Get message list for this week
          const response = await window.gapi.client.gmail.users.messages.list({
            userId: "me",
            maxResults: 500,
            q: searchQuery,
          });

          if (!response.result) {
            console.warn(`No response for week ${week.label}`);
            continue;
          }

          if (
            !response.result.messages ||
            response.result.messages.length === 0
          ) {
            console.log(`No messages found for week ${week.label}`);

            // Update progress
            setExportProgress((prev) => ({
              ...prev,
              weekProgress: 100,
              currentStep: `Week ${week.label} completed (0 emails)`,
            }));

            // Small delay before next week
            await delay(100);
            continue;
          }

          const weeklyMessages = response.result.messages;
          console.log(
            `Found ${weeklyMessages.length} messages for week ${week.label}`,
          );

          // Update total emails count
          setExportProgress((prev) => ({
            ...prev,
            totalEmails: prev.totalEmails + weeklyMessages.length,
            currentStep: `Processing ${weeklyMessages.length} emails for ${week.label}`,
          }));

          // Fetch detailed information for each message in this week (in batches)
          const batchSize = 8; // Smaller batch size for better progress tracking
          const weeklyEmailResults: (EmailData | null)[] = [];

          for (let i = 0; i < weeklyMessages.length; i += batchSize) {
            const batch = weeklyMessages.slice(i, i + batchSize);
            const batchProgress = Math.round((i / weeklyMessages.length) * 100);

            // Update week progress
            setExportProgress((prev) => ({
              ...prev,
              weekProgress: batchProgress,
              currentStep: `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(weeklyMessages.length / batchSize)} for ${week.label}`,
            }));

            console.log(
              `  Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(weeklyMessages.length / batchSize)} for week ${week.label}`,
            );

            const emailPromises = batch.map(async (message: { id: string }) => {
              try {
                const emailResponse =
                  await window.gapi.client.gmail.users.messages.get({
                    userId: "me",
                    id: message.id,
                    format: "full",
                  });

                if (!emailResponse?.result) {
                  return null;
                }

                return emailResponse.result;
              } catch (emailError) {
                console.error(
                  `Error fetching email ${message.id}:`,
                  emailError,
                );
                return null;
              }
            });

            const batchResults = await Promise.all(emailPromises);
            weeklyEmailResults.push(...batchResults);

            // Update processed emails count
            const validResults = batchResults.filter((email) => email !== null);
            setExportProgress((prev) => ({
              ...prev,
              processedEmails: prev.processedEmails + validResults.length,
            }));

            // Add delay between batches
            if (i + batchSize < weeklyMessages.length) {
              await delay(150); // Slightly longer delay for stability
            }
          }

          // Filter valid emails for this week
          const validWeeklyEmails = weeklyEmailResults.filter(
            (email): email is EmailData => email !== null,
          );

          allEmailResults.push(...validWeeklyEmails);

          // Mark week as complete
          setExportProgress((prev) => ({
            ...prev,
            weekProgress: 100,
            currentStep: `Week ${week.label} completed (${validWeeklyEmails.length} emails)`,
          }));

          console.log(
            `Completed week ${week.label}: ${validWeeklyEmails.length} emails`,
          );

          // Delay before next week
          await delay(300);
        } catch (weekError) {
          console.error(`Error processing week ${week.label}:`, weekError);

          setExportProgress((prev) => ({
            ...prev,
            weekProgress: 100,
            currentStep: `Week ${week.label} failed - continuing...`,
          }));

          // Continue with next week even if this one fails
          await delay(500);
        }
      }

      // Final progress update
      setExportProgress((prev) => ({
        ...prev,
        completedWeeks: weeklyIntervals.length,
        currentStep: "Creating export file...",
      }));

      console.log(
        `Successfully processed all weeks. Total emails: ${allEmailResults.length}`,
      );

      // Create export data structure
      const exportData = {
        dateRange: {
          start: exportStartDate,
          end: exportEndDate,
        },
        totalEmails: allEmailResults.length,
        weeklyBreakdown: weeklyIntervals.map((week) => ({
          week: week.label,
          start: week.start.toISOString(),
          end: week.end.toISOString(),
        })),
        emails: allEmailResults.map((email) => ({
          id: email.id,
          snippet: email.snippet,
          headers: getEmailHeaders(email),
          date: getHeader(getEmailHeaders(email), "Date"),
          from: getHeader(getEmailHeaders(email), "From"),
          subject: getHeader(getEmailHeaders(email), "Subject"),
          to: getHeader(getEmailHeaders(email), "To"),
          ignored: ignoredEmails.has(email.id),
        })),
        exportDate: new Date().toISOString(),
        fetchedBy: userInfo?.email || "unknown",
      };

      // Final step
      setExportProgress((prev) => ({
        ...prev,
        currentStep: "Download starting...",
      }));

      // Download the JSON file
      downloadJsonFile(
        exportData,
        `gmail-export-${exportStartDate}-to-${exportEndDate}`,
      );

      console.log(
        `Successfully exported ${allEmailResults.length} emails from ${weeklyIntervals.length} weeks`,
      );
    } catch (error) {
      console.error("Error exporting emails:", error);
      let errorMessage = "Unknown error occurred";

      if (error instanceof Error) {
        errorMessage = error.message;
      }

      setError(`Failed to export emails: ${errorMessage}`);
    } finally {
      setIsExporting(false);
      // Reset progress after a delay to show completion
      setTimeout(() => {
        setExportProgress({
          currentWeek: "",
          weekProgress: 0,
          totalWeeks: 0,
          completedWeeks: 0,
          totalEmails: 0,
          processedEmails: 0,
          currentStep: "",
        });
      }, 3000);
    }
  };

  // Function to export currently loaded emails with ignored flags
  const exportCurrentEmails = async () => {
    if (emails.length === 0) {
      setError("No emails to export");
      return;
    }

    try {
      // Suggest filename based on uploaded file or use default
      const defaultFilename = uploadedFile
        ? uploadedFile.name
        : `emails-export-${new Date().toISOString().split("T")[0]}.json`;

      const exportData = {
        source: dataSource === "upload" ? "uploaded_file" : "gmail_fetch",
        totalEmails: emails.length,
        ignoredCount: ignoredEmails.size,
        emails: emails.map((email) => ({
          id: email.id,
          snippet: email.snippet,
          headers: getEmailHeaders(email),
          date: getHeader(getEmailHeaders(email), "Date"),
          from: getHeader(getEmailHeaders(email), "From"),
          subject: getHeader(getEmailHeaders(email), "Subject"),
          to: getHeader(getEmailHeaders(email), "To"),
          ignored: ignoredEmails.has(email.id),
        })),
        exportDate: new Date().toISOString(),
        exportedBy: userInfo?.email || "offline_user",
      };

      const jsonString = JSON.stringify(exportData, null, 2);

      // Check if File System Access API is supported
      if ("showSaveFilePicker" in window) {
        try {
          // Use File System Access API for native Save As dialog
          const fileHandle = await (
            window as unknown as {
              showSaveFilePicker: (options: {
                suggestedName: string;
                types: {
                  description: string;
                  accept: Record<string, string[]>;
                }[];
              }) => Promise<{
                createWritable: () => Promise<{
                  write: (data: string) => Promise<void>;
                  close: () => Promise<void>;
                }>;
                name: string;
              }>;
            }
          ).showSaveFilePicker({
            suggestedName: defaultFilename,
            types: [
              {
                description: "JSON Files",
                accept: { "application/json": [".json"] },
              },
            ],
          });

          const writable = await fileHandle.createWritable();
          await writable.write(jsonString);
          await writable.close();

          console.log(
            `Exported ${emails.length} emails (${ignoredEmails.size} ignored) to ${fileHandle.name}`,
          );
          setSuccess(`Successfully exported to ${fileHandle.name}`);
        } catch (err) {
          // User cancelled the dialog
          if (err instanceof Error && err.name === "AbortError") {
            console.log("Export cancelled by user");
            return;
          }
          throw err;
        }
      } else {
        // Fallback to traditional download for browsers that don't support File System Access API
        const blob = new Blob([jsonString], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = defaultFilename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        console.log(
          `Exported ${emails.length} emails (${ignoredEmails.size} ignored)`,
        );
      }
    } catch (error) {
      console.error("Error exporting emails:", error);
      setError(
        `Export failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    }
  };

  // Function to download JSON file
  const downloadJsonFile = (data: object, filename: string) => {
    const jsonString = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${filename}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
    console.log(`Downloaded ${filename}.json`);
  };

  // Function to handle migration
  const handleMigration = async () => {
    try {
      setIsMigrating(true);
      setSmartFetchLogs([]);
      setShowSmartFetchConsole(true);

      const addLog = (
        message: string,
        type: "info" | "success" | "warning" | "error" = "info",
      ) => {
        const timestamp = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });
        let icon = "ℹ️";
        switch (type) {
          case "success":
            icon = "✅";
            break;
          case "warning":
            icon = "⚠️";
            break;
          case "error":
            icon = "❌";
            break;
        }
        setSmartFetchLogs((prev) => [
          ...prev,
          {
            timestamp,
            message: `${icon} ${message}`,
            type,
          },
        ]);
      };

      addLog("Starting migration process...", "info");

      const response = await fetch("/api/smart-fetch/migrate", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error(`Migration failed: ${response.statusText}`);
      }

      const result = await response.json();

      // Display logs from migration
      if (result.logs && Array.isArray(result.logs)) {
        result.logs.forEach((log: string) => {
          if (log.startsWith("ERROR:")) {
            addLog(log.replace("ERROR:", "").trim(), "error");
          } else if (log.startsWith("Warning:")) {
            addLog(log, "warning");
          } else if (log.includes("complete") || log.includes("Created")) {
            addLog(log, "success");
          } else {
            addLog(log, "info");
          }
        });
      }

      if (result.success) {
        addLog(`Migration successful!`, "success");
        setNeedsMigration(false);
        // Rescan cache
        await scanEmailCache();
      } else {
        addLog(`Migration completed with errors`, "warning");
      }
    } catch (error) {
      console.error("Migration error:", error);
      setError(
        `Migration failed: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
    } finally {
      setIsMigrating(false);
    }
  };

  // Function to handle smart fetching
  const handleSmartFetch = async () => {
    if (!isSignedIn) {
      setError("Please sign in first to use Smart Fetching");
      return;
    }

    try {
      setIsSmartFetching(true);
      setSmartFetchLogs([]);
      setShowSmartFetchConsole(true);
      setError("");

      const addLog = (
        message: string,
        type: "info" | "success" | "warning" | "error" = "info",
      ) => {
        const timestamp = new Date().toLocaleTimeString("en-US", {
          hour12: false,
        });
        let icon = "ℹ️";
        switch (type) {
          case "success":
            icon = "✅";
            break;
          case "warning":
            icon = "⚠️";
            break;
          case "error":
            icon = "❌";
            break;
        }
        setSmartFetchLogs((prev) => [
          ...prev,
          {
            timestamp,
            message: `${icon} ${message}`,
            type,
          },
        ]);
      };

      addLog("Starting Smart Fetching...", "info");

      // Get latest email date from cache
      if (!emailCacheInfo?.latestEmailDate) {
        addLog("No existing emails found, fetching last 30 days", "info");
      } else {
        const latestDate = new Date(emailCacheInfo.latestEmailDate);
        addLog(`Latest email: ${latestDate.toLocaleDateString()}`, "info");
      }

      // Calculate date range
      const startDate = emailCacheInfo?.latestEmailDate
        ? new Date(emailCacheInfo.latestEmailDate)
        : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000); // 30 days ago
      const endDate = new Date();

      const formatGmailDate = (date: Date) => {
        return `${date.getFullYear()}/${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getDate().toString().padStart(2, "0")}`;
      };

      addLog(
        `Fetching emails from ${startDate.toLocaleDateString()} to ${endDate.toLocaleDateString()}`,
        "info",
      );

      // Check Gmail API
      if (!window.gapi?.client?.gmail) {
        throw new Error("Gmail API not initialized");
      }

      const token = window.gapi.client.getToken();
      if (!token?.access_token) {
        throw new Error("No valid access token. Please sign in again.");
      }

      // Fetch emails
      const searchQuery = `after:${formatGmailDate(startDate)} before:${formatGmailDate(new Date(endDate.getTime() + 24 * 60 * 60 * 1000))}`;

      addLog("Querying Gmail API...", "info");

      const response = await window.gapi.client.gmail.users.messages.list({
        userId: "me",
        maxResults: 500,
        q: searchQuery,
      });

      if (!response.result?.messages || response.result.messages.length === 0) {
        addLog("No new emails found. You're up to date!", "success");
        setIsSmartFetching(false);
        return;
      }

      const messageIds = response.result.messages;
      addLog(`Found ${messageIds.length} email(s)`, "info");

      // Fetch email details in batches
      const batchSize = 10;
      const delay = (ms: number) =>
        new Promise((resolve) => setTimeout(resolve, ms));
      const allEmails: EmailData[] = [];

      for (let i = 0; i < messageIds.length; i += batchSize) {
        const batch = messageIds.slice(i, i + batchSize);
        addLog(
          `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(messageIds.length / batchSize)}`,
          "info",
        );

        const emailPromises = batch.map(async (message: { id: string }) => {
          try {
            const emailResponse =
              await window.gapi.client.gmail.users.messages.get({
                userId: "me",
                id: message.id,
                format: "full",
              });
            return emailResponse?.result || null;
          } catch (error) {
            console.error(`Error fetching email ${message.id}:`, error);
            return null;
          }
        });

        const batchResults = await Promise.all(emailPromises);
        const validEmails = batchResults.filter(
          (email): email is EmailData => email !== null,
        );
        allEmails.push(...validEmails);

        if (i + batchSize < messageIds.length) {
          await delay(200);
        }
      }

      addLog(`Fetched ${allEmails.length} email(s)`, "success");

      // Group by month
      addLog("Grouping emails by month...", "info");

      const getEmailDate = (email: EmailData): Date | null => {
        try {
          // Check if date is already parsed (from stored files)
          if (email.date) {
            return new Date(email.date);
          }

          // Otherwise, extract from headers (from Gmail API or stored files)
          const headers = email.payload?.headers || email.headers || [];
          const dateHeader = headers.find(
            (h) => h.name.toLowerCase() === "date",
          );
          if (dateHeader?.value) {
            return new Date(dateHeader.value);
          }

          return null;
        } catch (error) {
          console.warn("Failed to parse email date:", email.id, error);
          return null;
        }
      };

      const getMonthKey = (date: Date): string => {
        const year = date.getFullYear();
        const month = (date.getMonth() + 1).toString().padStart(2, "0");
        return `${year}-${month}`;
      };

      const grouped = new Map<string, EmailData[]>();

      for (const email of allEmails) {
        const emailDate = getEmailDate(email);
        if (!emailDate) {
          addLog(`Skipping email ${email.id} (no valid date)`, "warning");
          continue;
        }

        const monthKey = getMonthKey(emailDate);
        if (!grouped.has(monthKey)) {
          grouped.set(monthKey, []);
        }
        grouped.get(monthKey)!.push(email);
      }

      addLog(`Grouped into ${grouped.size} month(s)`, "info");

      // Update monthly files
      for (const [month, monthEmails] of grouped) {
        try {
          addLog(`Updating ${month}...`, "info");

          // Check if file exists
          const readResponse = await fetch(
            `/api/smart-fetch/read?month=${month}`,
          );
          const existingData = readResponse.ok
            ? await readResponse.json()
            : null;

          let allMonthEmails: EmailData[];
          let duplicatesSkipped = 0;

          if (existingData && existingData.emails) {
            // Merge with existing
            const existingIds = new Set(
              existingData.emails.map((e: EmailData) => e.id),
            );
            const uniqueNew = monthEmails.filter((e) => {
              if (existingIds.has(e.id)) {
                duplicatesSkipped++;
                return false;
              }
              return true;
            });
            allMonthEmails = [...existingData.emails, ...uniqueNew];
          } else {
            allMonthEmails = monthEmails;
          }

          // Sort by date
          allMonthEmails.sort((a, b) => {
            const dateA = getEmailDate(a);
            const dateB = getEmailDate(b);
            if (!dateA && !dateB) return 0;
            if (!dateA) return 1;
            if (!dateB) return -1;
            return dateA.getTime() - dateB.getTime();
          });

          // Prepare file data
          const [year, monthNum] = month.split("-").map(Number);
          const lastDay = new Date(year, monthNum, 0).getDate();

          const fileData = {
            dateRange: {
              start: `${month}-01`,
              end: `${month}-${lastDay.toString().padStart(2, "0")}`,
            },
            totalEmails: allMonthEmails.length,
            emails: allMonthEmails.map((email) => {
              // Safely access headers - could be in payload.headers or directly in headers
              const headers = email.payload?.headers || email.headers || [];

              return {
                id: email.id,
                snippet: email.snippet || "",
                headers: headers,
                date: getEmailDate(email)?.toISOString(),
                from: headers.find((h) => h.name.toLowerCase() === "from")
                  ?.value,
                subject: headers.find((h) => h.name.toLowerCase() === "subject")
                  ?.value,
                to: headers.find((h) => h.name.toLowerCase() === "to")?.value,
                ignored: email.ignored || false,
              };
            }),
            exportDate: existingData?.exportDate || new Date().toISOString(),
            fetchedBy: userInfo?.email || "unknown",
            lastUpdated: new Date().toISOString(),
          };

          // Write file
          const writeResponse = await fetch("/api/smart-fetch/write", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ month, data: fileData }),
          });

          if (!writeResponse.ok) {
            throw new Error(`Failed to write file for ${month}`);
          }

          const newEmailsCount = monthEmails.length - duplicatesSkipped;
          addLog(
            `${existingData ? "Updated" : "Created"} gmail-export-${month}.json (${newEmailsCount} new, ${allMonthEmails.length} total)`,
            "success",
          );

          if (duplicatesSkipped > 0) {
            addLog(
              `Skipped ${duplicatesSkipped} duplicate(s) in ${month}`,
              "info",
            );
          }
        } catch (error) {
          addLog(`Failed to update ${month}: ${error}`, "error");
        }
      }

      addLog(
        `Smart Fetching complete! ${allEmails.length} email(s) processed`,
        "success",
      );

      // Rescan cache to update info
      await scanEmailCache();
    } catch (error) {
      console.error("Smart fetching error:", error);
      const errorMsg = error instanceof Error ? error.message : "Unknown error";
      setError(`Smart Fetching failed: ${errorMsg}`);
      setSmartFetchLogs((prev) => [
        ...prev,
        {
          timestamp: new Date().toLocaleTimeString("en-US", { hour12: false }),
          message: `❌ ${errorMsg}`,
          type: "error",
        },
      ]);
    } finally {
      setIsSmartFetching(false);
    }
  };

  // Function to handle file upload and processing
  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploadedFile(file);
    setIsProcessingUpload(true);
    setError("");

    try {
      const text = await file.text();
      const jsonData = JSON.parse(text); // Validate the JSON structure
      if (!jsonData.emails || !Array.isArray(jsonData.emails)) {
        throw new Error(
          "Invalid file format: Missing or invalid 'emails' array",
        );
      }

      // Transform the data to match our expected email format
      const transformedEmails = jsonData.emails.map(
        (
          email: {
            id?: string;
            snippet?: string;
            headers?: object[];
            body?: object;
            parts?: object[];
            ignored?: boolean;
          },
          index: number,
        ) => {
          if (!email.id) {
            email.id = `uploaded-${index}`;
          }

          // Ensure we have the required structure
          return {
            id: email.id,
            snippet: email.snippet || "",
            payload: {
              headers: email.headers || [],
              body: email.body || {},
              parts: email.parts || [],
            },
            ignored: email.ignored || false, // Load ignored status from file
          };
        },
      );

      // Load ignored emails into Set
      const ignoredSet = new Set<string>();
      transformedEmails.forEach((email: EmailData) => {
        if (email.ignored) {
          ignoredSet.add(email.id);
        }
      });
      setIgnoredEmails(ignoredSet);

      // Store original emails for re-filtering
      setOriginalUploadedEmails(transformedEmails); // Apply sender filtering if "Selected Senders Only" is chosen
      let finalEmails = transformedEmails;
      if (!showAllUploadSenders) {
        finalEmails = transformedEmails.filter((email: EmailData) => {
          const sender = getHeader(getEmailHeaders(email), "From");
          return selectedSenders.some((organization) =>
            sender?.toLowerCase().includes(organization.toLowerCase()),
          );
        });
      }

      // Update state with filtered emails
      setEmails(finalEmails); // For uploaded files, we don't need to cache in localStorage
      // as the data is already stored in the file itself
      // Just set a cache age to indicate data freshness
      setCacheAge(new Date());
      setFetchTime(0);

      // Clear any existing errors and set success message
      setError("");
      setSuccess(
        `Successfully loaded ${finalEmails.length} emails from ${file.name}` +
          (showAllUploadSenders
            ? ""
            : ` (filtered from ${transformedEmails.length} total emails)`),
      );

      console.log(
        `Successfully loaded ${finalEmails.length} emails from ${file.name}` +
          (showAllUploadSenders
            ? ""
            : ` (filtered from ${transformedEmails.length} total emails)`),
      );
    } catch (error) {
      console.error("Error processing uploaded file:", error);
      let errorMessage = "Failed to process uploaded file";

      if (error instanceof Error) {
        errorMessage = error.message;
      } else if (error instanceof SyntaxError) {
        errorMessage = "Invalid JSON format in uploaded file";
      }

      setSuccess(""); // Clear any existing success messages
      setError(errorMessage);
      setUploadedFile(null);
    } finally {
      setIsProcessingUpload(false);
      // Reset the input
      event.target.value = "";
    }
  }; // Effect to handle re-filtering when switching between "All Senders" and "Selected Senders"
  useEffect(() => {
    if (dataSource === "upload" && originalUploadedEmails.length > 0) {
      let filteredEmails = originalUploadedEmails;

      if (!showAllUploadSenders) {
        // Filter emails by selected senders
        filteredEmails = originalUploadedEmails.filter((email: EmailData) => {
          const fromHeader = getHeader(getEmailHeaders(email), "From");
          if (!fromHeader) return false;

          return selectedSenders.some((organization) => {
            const senderLower = fromHeader.toLowerCase();
            const orgLower = organization.toLowerCase();

            // Special case: When filtering for "Inter", exclude Pinterest and Auditoria Interna emails
            if (orgLower === "inter") {
              if (
                senderLower.includes("@discover.pinterest.com") ||
                senderLower.includes("auditoria interna")
              ) {
                return false;
              }
            }

            return senderLower.includes(orgLower);
          });
        });
      }

      setEmails(filteredEmails);

      // Update success message if we have an uploaded file
      if (uploadedFile) {
        setError(""); // Clear any existing errors
        setSuccess(
          `Successfully loaded ${filteredEmails.length} emails from ${uploadedFile.name}` +
            (showAllUploadSenders
              ? ""
              : ` (filtered from ${originalUploadedEmails.length} total emails)`),
        );
      }
    }
  }, [
    showAllUploadSenders,
    selectedSenders,
    dataSource,
    originalUploadedEmails,
    uploadedFile,
  ]);
  // Function to clear uploaded data and reset to fetch mode
  const clearUploadedData = () => {
    setUploadedFile(null);
    setEmails([]);
    setOriginalUploadedEmails([]);
    setDataSource("fetch");
    setCacheAge(null);
    setFetchTime(null);
    setSuccess(""); // Clear success message
    setError(""); // Clear error message
    // Note: We don't remove cache here since it might contain fetched Gmail data
    // Only clear if we're certain it was from upload mode
  };
  // Memoized function to process emails by day for chart
  const emailsByDay = useMemo(() => {
    const emailsByDay: Record<string, number> = {};

    emails.forEach((email) => {
      const dateHeader = getHeader(getEmailHeaders(email), "Date");
      if (dateHeader) {
        try {
          const date = new Date(dateHeader);
          const dayKey = date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
          });
          emailsByDay[dayKey] = (emailsByDay[dayKey] || 0) + 1;
        } catch {
          console.warn("Invalid date format:", dateHeader);
        }
      }
    });

    // Convert to array and sort by date
    return Object.entries(emailsByDay)
      .map(([day, count]) => ({ day, count }))
      .sort((a, b) => {
        try {
          const dateA = new Date(a.day + ", " + new Date().getFullYear());
          const dateB = new Date(b.day + ", " + new Date().getFullYear());
          return dateA.getTime() - dateB.getTime();
        } catch {
          return 0;
        }
      })
      .slice(-14); // Show last 14 days
  }, [emails]);

  // Function to get date range information
  const getDateRangeInfo = () => {
    if (emails.length === 0) return { span: "--", oldest: null, newest: null };

    const validDates = emails
      .map((email) => {
        const dateHeader = getHeader(getEmailHeaders(email), "Date");
        try {
          return dateHeader ? new Date(dateHeader) : null;
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date !== null && !isNaN(date.getTime()));

    if (validDates.length === 0)
      return { span: "--", oldest: null, newest: null };

    const oldest = new Date(Math.min(...validDates.map((d) => d.getTime())));
    const newest = new Date(Math.max(...validDates.map((d) => d.getTime())));

    const diffMs = newest.getTime() - oldest.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    let span = "";
    if (diffDays === 0) {
      span = "Same day";
    } else if (diffDays === 1) {
      span = "1 day";
    } else if (diffDays < 30) {
      span = `${diffDays} days`;
    } else if (diffDays < 365) {
      const months = Math.round(diffDays / 30);
      span = months === 1 ? "1 month" : `${months} months`;
    } else {
      const years = Math.round(diffDays / 365);
      span = years === 1 ? "1 year" : `${years} years`;
    }
    return { span, oldest, newest };
  };

  // Memoized function to calculate email frequency statistics
  const emailFrequencyStats = useMemo(() => {
    if (emails.length === 0)
      return { perDay: "--", perWeek: "--", perMonth: "--" };

    const validDates = emails
      .map((email) => {
        const dateHeader = getHeader(getEmailHeaders(email), "Date");
        try {
          return dateHeader ? new Date(dateHeader) : null;
        } catch {
          return null;
        }
      })
      .filter((date): date is Date => date !== null && !isNaN(date.getTime()));

    if (validDates.length === 0)
      return { perDay: "--", perWeek: "--", perMonth: "--" };

    const oldest = new Date(Math.min(...validDates.map((d) => d.getTime())));
    const newest = new Date(Math.max(...validDates.map((d) => d.getTime())));

    const diffMs = newest.getTime() - oldest.getTime();
    const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24))); // Minimum 1 day
    const diffWeeks = diffDays / 7;
    const diffMonths = diffDays / 30.44; // Average days per month

    const emailCount = emails.length;

    return {
      perDay: (emailCount / diffDays).toFixed(1),
      perWeek: (emailCount / diffWeeks).toFixed(1),
      perMonth: (emailCount / diffMonths).toFixed(1),
    };
  }, [emails]);

  // Memoized function to detect outliers in email patterns
  const outlierAnalysis = useMemo(() => {
    if (emails.length === 0)
      return {
        outlierDays: "--",
        topSender: "--",
        unusualPatterns: "--",
        details: null,
      };

    // 1. Analyze daily email counts for outlier days
    const emailsByDay: Record<string, number> = {};
    emails.filter((email) => {
      const dateHeader = getHeader(getEmailHeaders(email), "Date");
      try {
        if (dateHeader) {
          const date = new Date(dateHeader);
          const dayKey = date.toISOString().split("T")[0]; // YYYY-MM-DD format
          emailsByDay[dayKey] = (emailsByDay[dayKey] || 0) + 1;
          return true;
        }
      } catch {
        console.warn("Invalid date format:", dateHeader);
      }
      return false;
    });

    const dailyCounts = Object.values(emailsByDay);
    if (dailyCounts.length === 0)
      return {
        outlierDays: "--",
        topSender: "--",
        unusualPatterns: "--",
        details: null,
      };

    // Calculate statistical measures for outlier detection
    const mean = dailyCounts.reduce((a, b) => a + b, 0) / dailyCounts.length;
    const variance =
      dailyCounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) /
      dailyCounts.length;
    const stdDev = Math.sqrt(variance);

    // Define outliers as values more than 2 standard deviations from mean
    const outlierThreshold = mean + 2 * stdDev;
    const outlierDays = Object.entries(emailsByDay).filter(
      ([, count]) => count > outlierThreshold,
    );

    // 2. Analyze sender patterns to find top outlier
    const senderCounts: Record<string, number> = {};
    emails.forEach((email) => {
      const sender = getHeader(getEmailHeaders(email), "From");
      const senderEmail = sender.match(/<(.+?)>/)
        ? sender.match(/<(.+?)>/)![1]
        : sender;
      const senderName = sender.match(/^([^<]+)/)
        ? sender
            .match(/^([^<]+)/)![1]
            .trim()
            .replace(/"/g, "")
        : senderEmail;
      const displayName = senderName !== senderEmail ? senderName : senderEmail;

      senderCounts[displayName] = (senderCounts[displayName] || 0) + 1;
    });

    const senderCountsArray = Object.values(senderCounts);
    const senderMean =
      senderCountsArray.reduce((a, b) => a + b, 0) / senderCountsArray.length;
    const senderStdDev = Math.sqrt(
      senderCountsArray.reduce((a, b) => a + Math.pow(b - senderMean, 2), 0) /
        senderCountsArray.length,
    );

    const topSender = Object.entries(senderCounts).sort(
      ([, a], [, b]) => b - a,
    )[0];

    const isTopSenderOutlier =
      topSender && topSender[1] > senderMean + 2 * senderStdDev;

    // 3. Detect unusual patterns (emails sent at unusual hours)
    const hourCounts: Record<number, number> = {};
    emails.forEach((email) => {
      const dateHeader = getHeader(getEmailHeaders(email), "Date");
      try {
        if (dateHeader) {
          const date = new Date(dateHeader);
          const hour = date.getHours();
          hourCounts[hour] = (hourCounts[hour] || 0) + 1;
        }
      } catch {
        // Skip invalid dates
      }
    });

    // Find unusual hours (late night/early morning: 11PM - 5AM)
    const unusualHours = [23, 0, 1, 2, 3, 4, 5];
    const unusualHourEmails = unusualHours.reduce(
      (sum, hour) => sum + (hourCounts[hour] || 0),
      0,
    );
    const unusualHourPercentage = (unusualHourEmails / emails.length) * 100;

    return {
      outlierDays: outlierDays.length.toString(),
      topSender: isTopSenderOutlier
        ? topSender[0].substring(0, 20) +
          (topSender[0].length > 20 ? "..." : "")
        : "None",
      unusualPatterns: `${unusualHourPercentage.toFixed(1)}%`,
      details: {
        outlierDaysData: outlierDays,
        topSenderData: topSender,
        isTopSenderOutlier,
        unusualHourEmails,
        totalEmails: emails.length,
        mean: mean.toFixed(1),
        stdDev: stdDev.toFixed(1),
        outlierThreshold: outlierThreshold.toFixed(1),
      },
    };
  }, [emails]);

  const chartConfig = {
    count: {
      label: "Emails",
      color: "hsl(var(--primary))",
    },
  };

  return (
    <div className="container mx-auto p-6 max-w-8xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Gmail Client</h1>
        <p className="text-muted-foreground">
          {offlineMode
            ? "Offline mode - Upload and analyze your exported Gmail data"
            : "Connect to your Gmail account to view your emails"}
        </p>
      </div>{" "}
      {error && (
        <div className="mb-6 p-4 border border-red-200 bg-red-50 rounded-lg text-red-800 dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div className="mb-6 p-4 border border-green-200 bg-green-50 rounded-lg text-green-800 dark:border-green-800 dark:bg-green-900/20 dark:text-green-400">
          <div className="flex items-center gap-2">
            <Mail className="h-4 w-4" />
            <span>{success}</span>
          </div>
        </div>
      )}
      {/* Email Cache Status Banner */}
      {emailCacheInfo &&
        !emailCacheInfo.scanning &&
        emailCacheInfo.totalFiles > 0 && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 border-blue-200 dark:border-blue-800">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-lg">
                <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                📧 Email Cache Status
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="font-medium">
                    {emailCacheInfo.totalFiles} monthly archives found
                  </span>
                </div>
                {emailCacheInfo.latestFile && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      Latest:{" "}
                      {emailCacheInfo.latestFile
                        .replace("gmail-export-", "")
                        .replace(".json", "")}
                    </span>
                  </div>
                )}
                {emailCacheInfo.latestEmailDate && (
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span>
                      Last email:{" "}
                      {new Date(
                        emailCacheInfo.latestEmailDate,
                      ).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                )}
              </div>

              {emailCacheInfo.needsMigration && (
                <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                        Migration Needed
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300 mt-1">
                        Your email files need to be reorganized into the new
                        monthly format. This will improve performance and
                        organization.
                      </p>
                      <Button
                        onClick={handleMigration}
                        disabled={isMigrating}
                        size="sm"
                        variant="outline"
                        className="mt-2 border-yellow-600 text-yellow-700 hover:bg-yellow-100 dark:border-yellow-400 dark:text-yellow-300 dark:hover:bg-yellow-900/20"
                      >
                        {isMigrating ? (
                          <>
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" />
                            Migrating...
                          </>
                        ) : (
                          "Run Migration"
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!isSignedIn &&
                !offlineMode &&
                !emailCacheInfo.needsMigration && (
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-blue-800 dark:text-blue-200">
                      <Info className="h-4 w-4" />
                      <span>
                        Sign in to use Smart Fetching and automatically sync
                        your latest emails
                      </span>
                    </div>
                  </div>
                )}
            </CardContent>
          </Card>
        )}
      {emailCacheInfo?.scanning && (
        <Card className="mb-6">
          <CardContent className="py-6">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Scanning email cache...</span>
            </div>
          </CardContent>
        </Card>
      )}
      {!offlineMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Account Status
            </CardTitle>{" "}
            <CardDescription>
              {isSignedIn
                ? "You are signed in to Gmail (session will persist for 10 minutes)"
                : isCheckingAuth
                  ? "Checking for existing session..."
                  : "Sign in to access your Gmail account"}
            </CardDescription>
          </CardHeader>{" "}
          <CardContent>
            {!isSignedIn ? (
              <div className="space-y-4">
                <Button
                  onClick={handleSignIn}
                  disabled={loading || isCheckingAuth}
                  className="w-full sm:w-auto"
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : isCheckingAuth ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Checking authentication...
                    </>
                  ) : (
                    <>
                      <Mail className="mr-2 h-4 w-4" />
                      Sign in with Google
                    </>
                  )}
                </Button>
                <div className="pt-4 border-t">
                  <p className="text-sm text-muted-foreground mb-2">
                    Don&apos;t want to sign in? Use offline mode to analyze
                    exported Gmail data
                  </p>
                  <Button
                    onClick={() => {
                      setOfflineMode(true);
                      setDataSource("upload");
                    }}
                    variant="outline"
                    className="w-full sm:w-auto"
                  >
                    <Upload className="mr-2 h-4 w-4" />
                    Use Offline Mode
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                {" "}
                {userInfo && (
                  <div className="flex items-center gap-3">
                    {userInfo.picture && (
                      <Image
                        src={userInfo.picture}
                        alt="Profile"
                        width={40}
                        height={40}
                        className="w-10 h-10 rounded-full"
                      />
                    )}
                    <div>
                      <p className="font-medium">{userInfo.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {userInfo.email}
                      </p>
                    </div>
                  </div>
                )}
                <div className="flex gap-2">
                  {dataSource === "fetch" && (
                    <Button
                      onClick={fetchEmails}
                      disabled={loading || isLoadingFromCache}
                      variant="outline"
                    >
                      {loading || isLoadingFromCache ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          {isLoadingFromCache
                            ? "Loading cache..."
                            : "Loading..."}
                        </>
                      ) : (
                        <>
                          <Mail className="mr-2 h-4 w-4" />
                          Refresh Emails
                        </>
                      )}
                    </Button>
                  )}
                  <Button onClick={handleSignOut} variant="outline">
                    Sign Out
                  </Button>
                  {cacheAge && dataSource === "fetch" && (
                    <Button onClick={clearCache} variant="outline" size="sm">
                      Clear Cache
                    </Button>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
      {offlineMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Offline Mode
            </CardTitle>
            <CardDescription>
              You are using offline mode. Upload exported Gmail JSON files to
              analyze your data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                <p className="text-sm text-blue-800 dark:text-blue-400">
                  📁 In offline mode, you can upload and analyze previously
                  exported Gmail data without signing in to Google.
                </p>
              </div>
              <Button
                onClick={() => {
                  setOfflineMode(false);
                  setDataSource("fetch");
                  setEmails([]);
                  setOriginalUploadedEmails([]);
                  setUploadedFile(null);
                }}
                variant="outline"
                className="w-full sm:w-auto"
              >
                <Mail className="mr-2 h-4 w-4" />
                Switch to Online Mode
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
      {/* Data Source Selection Card */}
      {(isSignedIn || offlineMode) && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Data Source
            </CardTitle>
            <CardDescription>
              {offlineMode
                ? "Upload previously exported JSON files for analysis"
                : "Choose to fetch new data from Gmail or upload previously saved JSON files"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {!offlineMode && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Fetch from Gmail Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      dataSource === "fetch"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => {
                      if (uploadedFile) {
                        clearUploadedData();
                      }
                      setDataSource("fetch");
                    }}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Mail className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Fetch from Gmail</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Connect to Gmail API and fetch emails for a specific date
                      range
                    </p>
                    {dataSource === "fetch" && (
                      <div className="mt-2">
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Upload JSON File Option */}
                  <div
                    className={`border rounded-lg p-4 cursor-pointer transition-all ${
                      dataSource === "upload"
                        ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                        : "border-border hover:border-primary/50"
                    }`}
                    onClick={() => setDataSource("upload")}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <Upload className="h-5 w-5 text-primary" />
                      <h3 className="font-medium">Upload JSON File</h3>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Upload a previously exported JSON file to analyze existing
                      data
                    </p>
                    {dataSource === "upload" && (
                      <div className="mt-2">
                        <Badge variant="default" className="text-xs">
                          Selected
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {/* File Upload Section */}
              {(dataSource === "upload" || offlineMode) && (
                <div className="space-y-4">
                  {/* Sender Selection for Upload */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-sm">Upload Options</h4>{" "}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          showAllUploadSenders
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setShowAllUploadSenders(true)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            All Senders
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Upload and display emails from all senders in the file
                        </p>
                      </div>
                      <div
                        className={`border rounded-lg p-3 cursor-pointer transition-all ${
                          !showAllUploadSenders
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50"
                        }`}
                        onClick={() => setShowAllUploadSenders(false)}
                      >
                        <div className="flex items-center gap-2 mb-1">
                          <Filter className="h-4 w-4" />
                          <span className="font-medium text-sm">
                            Selected Senders Only
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Filter to show only emails from selected financial
                          institutions
                        </p>
                      </div>
                    </div>
                    {/* Selected Senders List for Upload Mode */}
                    {!showAllUploadSenders && (
                      <div className="bg-muted/30 rounded-lg p-3">
                        <h5 className="text-sm font-medium mb-2">
                          Selected Financial Institutions:
                        </h5>
                        <div className="flex flex-wrap gap-1">
                          {selectedSenders.map((sender) => (
                            <Badge
                              key={sender}
                              variant="secondary"
                              className="text-xs"
                            >
                              {sender}
                            </Badge>
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                          Emails will be filtered to include only these
                          institutions when uploaded
                        </p>
                      </div>
                    )}
                  </div>

                  {!uploadedFile ? (
                    <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
                      <div className="text-center">
                        <Upload className="mx-auto h-8 w-8 text-muted-foreground mb-2" />
                        <h3 className="text-sm font-medium mb-1">
                          Upload JSON File
                        </h3>
                        <p className="text-xs text-muted-foreground mb-4">
                          Select a previously exported email JSON file
                        </p>
                        <input
                          type="file"
                          accept=".json"
                          onChange={handleFileUpload}
                          className="hidden"
                          id="json-file-upload"
                          disabled={isProcessingUpload}
                        />
                        <label htmlFor="json-file-upload">
                          <Button
                            variant="outline"
                            className="cursor-pointer"
                            disabled={isProcessingUpload}
                            asChild
                          >
                            <span>
                              {isProcessingUpload ? (
                                <>
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  Processing...
                                </>
                              ) : (
                                <>
                                  <FileText className="mr-2 h-4 w-4" />
                                  Choose File
                                </>
                              )}
                            </span>
                          </Button>
                        </label>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <FileText className="h-5 w-5 text-green-600 dark:text-green-400" />
                          <div>
                            <h3 className="font-medium text-green-800 dark:text-green-200">
                              File Uploaded Successfully
                            </h3>
                            <p className="text-sm text-green-600 dark:text-green-400">
                              {uploadedFile.name} (
                              {(uploadedFile.size / 1024).toFixed(1)} KB)
                            </p>
                            <p className="text-xs text-green-600 dark:text-green-400">
                              {emails.length} emails loaded from file
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={clearUploadedData}
                          className="text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-200"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
      {/* Data Export Card */}
      {isSignedIn && dataSource === "fetch" && !offlineMode && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Download className="h-5 w-5" />
              Export Email Data
            </CardTitle>
            <CardDescription>
              Download your emails for a specific date range as JSON
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label
                    htmlFor="export-start-date"
                    className="text-sm font-medium"
                  >
                    Start Date
                  </label>
                  <Input
                    id="export-start-date"
                    type="date"
                    value={exportStartDate}
                    onChange={(e) => setExportStartDate(e.target.value)}
                    disabled={isExporting}
                  />
                </div>
                <div className="space-y-2">
                  <label
                    htmlFor="export-end-date"
                    className="text-sm font-medium"
                  >
                    End Date
                  </label>
                  <Input
                    id="export-end-date"
                    type="date"
                    value={exportEndDate}
                    onChange={(e) => setExportEndDate(e.target.value)}
                    disabled={isExporting}
                  />
                </div>
              </div>{" "}
              {isExporting && (
                <div className="space-y-4 bg-muted/20 rounded-lg p-4 border">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">Overall Progress</span>
                      <span className="text-muted-foreground">
                        {exportProgress.completedWeeks} /{" "}
                        {exportProgress.totalWeeks} weeks
                      </span>
                    </div>
                    <Progress
                      value={
                        exportProgress.totalWeeks > 0
                          ? (exportProgress.completedWeeks /
                              exportProgress.totalWeeks) *
                            100
                          : 0
                      }
                      className="h-2"
                    />
                  </div>

                  {exportProgress.currentWeek && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Current Week: {exportProgress.currentWeek}
                        </span>
                        <span className="text-muted-foreground">
                          {exportProgress.weekProgress}%
                        </span>
                      </div>
                      <Progress
                        value={exportProgress.weekProgress}
                        className="h-2"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div className="bg-background rounded p-3 border">
                      <div className="text-muted-foreground">
                        Total Emails Found
                      </div>
                      <div className="font-semibold text-lg">
                        {exportProgress.totalEmails}
                      </div>
                    </div>
                    <div className="bg-background rounded p-3 border">
                      <div className="text-muted-foreground">
                        Emails Processed
                      </div>
                      <div className="font-semibold text-lg">
                        {exportProgress.processedEmails}
                      </div>
                    </div>
                    <div className="bg-background rounded p-3 border">
                      <div className="text-muted-foreground">
                        Weeks Completed
                      </div>
                      <div className="font-semibold text-lg">
                        {exportProgress.completedWeeks}
                      </div>
                    </div>
                  </div>

                  {exportProgress.currentStep && (
                    <div className="text-sm text-muted-foreground bg-background rounded p-3 border">
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-3 w-3 animate-spin" />
                        <span>{exportProgress.currentStep}</span>
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex items-center justify-between">
                <div className="text-sm text-muted-foreground">
                  {exportStartDate && exportEndDate && (
                    <span>
                      Export period:{" "}
                      {new Date(exportStartDate).toLocaleDateString()} -{" "}
                      {new Date(exportEndDate).toLocaleDateString()}
                    </span>
                  )}
                </div>
                <Button
                  onClick={exportEmailsForDateRange}
                  disabled={isExporting || !exportStartDate || !exportEndDate}
                  className="min-w-[120px]"
                >
                  {isExporting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Exporting...
                    </>
                  ) : (
                    <>
                      <Download className="mr-2 h-4 w-4" />
                      Export Data
                    </>
                  )}
                </Button>
              </div>
              {exportStartDate && exportEndDate && !isExporting && (
                <div className="text-xs text-muted-foreground bg-muted/30 rounded p-3">
                  {" "}
                  <strong>Note:</strong> This will fetch emails from Gmail for
                  the specified date range and download them as a JSON file
                  named &quot;gmail-export-{exportStartDate}-to-{exportEndDate}
                  .json&quot;. The file will include email headers, subjects,
                  senders, and snippets. Large date ranges will be processed
                  week by week with real-time progress tracking.
                </div>
              )}
              {/* Smart Fetching Section */}
              <div className="pt-6 border-t">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold flex items-center gap-2">
                      <Zap className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                      Smart Fetching
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Automatically fetch and organize new emails into monthly
                      files
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setShowSmartFetchConsole(!showSmartFetchConsole)
                    }
                    disabled={isSmartFetching || needsMigration}
                    variant={showSmartFetchConsole ? "default" : "outline"}
                    className="gap-2"
                  >
                    {isSmartFetching ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Fetching...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        {showSmartFetchConsole
                          ? "Hide Console"
                          : "Start Smart Fetching"}
                      </>
                    )}
                  </Button>
                </div>

                {needsMigration && (
                  <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                    <div className="flex items-center gap-2 text-sm text-yellow-800 dark:text-yellow-200">
                      <AlertCircle className="h-4 w-4" />
                      <span>
                        Please run migration first before using Smart Fetching
                      </span>
                    </div>
                  </div>
                )}

                {showSmartFetchConsole && (
                  <div className="mt-4">
                    <Accordion type="single" collapsible defaultValue="console">
                      <AccordionItem
                        value="console"
                        className="border rounded-lg"
                      >
                        <AccordionTrigger className="px-4 hover:no-underline">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span className="font-medium">Console Log</span>
                            {smartFetchLogs.length > 0 && (
                              <Badge variant="secondary" className="ml-2">
                                {smartFetchLogs.length} entries
                              </Badge>
                            )}
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 pb-4">
                            {smartFetchLogs.length === 0 && !isSmartFetching ? (
                              <div className="text-center py-8 text-muted-foreground">
                                <Info className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">
                                  No logs yet. Click &quot;Start Smart
                                  Fetching&quot; to begin.
                                </p>
                              </div>
                            ) : (
                              <div className="bg-slate-950 dark:bg-slate-900 rounded-lg p-4 font-mono text-xs max-h-96 overflow-y-auto">
                                {smartFetchLogs.map((log, index) => (
                                  <div
                                    key={index}
                                    className={`mb-1 ${
                                      log.type === "error"
                                        ? "text-red-400"
                                        : log.type === "warning"
                                          ? "text-yellow-400"
                                          : log.type === "success"
                                            ? "text-green-400"
                                            : "text-blue-300"
                                    }`}
                                  >
                                    <span className="text-slate-500">
                                      [{log.timestamp}]
                                    </span>{" "}
                                    {log.message}
                                  </div>
                                ))}
                                {isSmartFetching && (
                                  <div className="text-blue-400 animate-pulse">
                                    <Loader2 className="inline h-3 w-3 animate-spin mr-2" />
                                    Processing...
                                  </div>
                                )}
                              </div>
                            )}

                            {!isSmartFetching &&
                              smartFetchLogs.length === 0 && (
                                <div className="mt-4">
                                  <Button
                                    onClick={handleSmartFetch}
                                    disabled={needsMigration}
                                    className="w-full"
                                    size="lg"
                                  >
                                    <Zap className="mr-2 h-4 w-4" />
                                    Start Smart Fetching
                                  </Button>
                                </div>
                              )}

                            {!isSmartFetching && smartFetchLogs.length > 0 && (
                              <div className="mt-4 flex gap-2">
                                <Button
                                  onClick={() => setSmartFetchLogs([])}
                                  variant="outline"
                                  size="sm"
                                  className="flex-1"
                                >
                                  Clear Logs
                                </Button>
                                <Button
                                  onClick={handleSmartFetch}
                                  disabled={needsMigration}
                                  size="sm"
                                  className="flex-1"
                                >
                                  <Zap className="mr-2 h-4 w-4" />
                                  Run Again
                                </Button>
                              </div>
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                )}

                {emailCacheInfo &&
                  !needsMigration &&
                  !showSmartFetchConsole && (
                    <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm">
                      <div className="flex items-start gap-2">
                        <Info className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="font-medium mb-1">
                            How Smart Fetching Works:
                          </p>
                          <ul className="space-y-1 text-muted-foreground text-xs list-disc list-inside">
                            <li>
                              Fetches new emails from your latest cached email
                              date to today
                            </li>
                            <li>Automatically groups emails by month</li>
                            <li>
                              Updates existing monthly files without duplicates
                            </li>
                            <li>Creates new monthly files as needed</li>
                            <li>
                              Maintains organized JSON files at
                              C:\Users\carlo\GITHUB\finance-tracker\privat\data\email
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      {(isSignedIn || offlineMode) && emails.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Email Statistics
            </CardTitle>{" "}
            <CardDescription>
              Overview of your{" "}
              {dataSource === "upload" ? "uploaded" : "fetched"} emails
            </CardDescription>
          </CardHeader>{" "}
          <CardContent>
            {" "}
            {cacheAge && dataSource === "fetch" && (
              <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm text-blue-800 dark:text-blue-400">
                      Cached data from {cacheAge.toLocaleString()}
                    </span>
                  </div>
                  <Button
                    onClick={clearCache}
                    variant="ghost"
                    size="sm"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    Clear
                  </Button>
                </div>
                {storageInfo && (
                  <div className="text-xs text-blue-700 dark:text-blue-300">
                    Storage: {(storageInfo.size / (1024 * 1024)).toFixed(2)} MB
                    used
                    {storageInfo.quota &&
                      ` / ${(storageInfo.quota / (1024 * 1024 * 1024)).toFixed(1)} GB available`}
                  </div>
                )}
              </div>
            )}{" "}
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {emails.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total Emails
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {
                    new Set(
                      emails.map((email) =>
                        getHeader(getEmailHeaders(email), "From"),
                      ),
                    ).size
                  }
                </div>
                <div className="text-sm text-muted-foreground">
                  Unique Senders
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {
                    emails.filter(
                      (email) =>
                        new Date(
                          getHeader(getEmailHeaders(email), "Date"),
                        ).toDateString() === new Date().toDateString(),
                    ).length
                  }
                </div>{" "}
                <div className="text-sm text-muted-foreground">
                  Today&apos;s Emails
                </div>
              </div>{" "}
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <div className="cursor-help">
                      <div className="text-2xl font-bold text-primary">
                        {getDateRangeInfo().span}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Date Range
                      </div>
                    </div>
                  </HoverCardTrigger>
                  <HoverCardContent className="w-80">
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">
                        Email Date Range
                      </h4>
                      {(() => {
                        const { oldest, newest } = getDateRangeInfo();
                        return oldest && newest ? (
                          <div className="text-sm">
                            <p>
                              <strong>Oldest:</strong>{" "}
                              {oldest.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                            <p>
                              <strong>Newest:</strong>{" "}
                              {newest.toLocaleDateString("en-US", {
                                weekday: "short",
                                year: "numeric",
                                month: "short",
                                day: "numeric",
                              })}
                            </p>
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">
                            No date information available
                          </p>
                        );
                      })()}
                    </div>
                  </HoverCardContent>
                </HoverCard>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-lg font-bold text-primary">
                  {(() => {
                    const { oldest } = getDateRangeInfo();
                    return oldest
                      ? oldest.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "--";
                  })()}
                </div>
                <div className="text-sm text-muted-foreground">
                  Oldest Email
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {fetchTime ? `${(fetchTime / 1000).toFixed(2)}s` : "--"}
                </div>
                <div className="text-sm text-muted-foreground">
                  Fetch Time
                </div>{" "}
              </div>{" "}
            </div>{" "}
            {/* Email Frequency Statistics Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {emailFrequencyStats.perDay}
                </div>
                <div className="text-sm text-muted-foreground">
                  Emails per Day
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {emailFrequencyStats.perWeek}
                </div>
                <div className="text-sm text-muted-foreground">
                  Emails per Week
                </div>
              </div>
              <div className="bg-muted/50 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-primary">
                  {emailFrequencyStats.perMonth}
                </div>
                <div className="text-sm text-muted-foreground">
                  Emails per Month
                </div>{" "}
              </div>
            </div>{" "}
            {/* Outlier Analysis Statistics Row */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-4 w-4" />
                <h4 className="font-medium">Outlier Analysis</h4>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <HoverCard>
                    {" "}
                    <HoverCardTrigger asChild>
                      <div className="cursor-help">
                        <div className="text-2xl font-bold text-primary">
                          {outlierAnalysis.outlierDays}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Outlier Days
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Outlier Days Analysis
                        </h4>{" "}
                        {(() => {
                          const { details } = outlierAnalysis;
                          return details ? (
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Average emails/day:</strong>{" "}
                                {details.mean}
                              </p>
                              <p>
                                <strong>Standard deviation:</strong>{" "}
                                {details.stdDev}
                              </p>
                              <p>
                                <strong>Outlier threshold:</strong>{" "}
                                {details.outlierThreshold}
                              </p>{" "}
                              {details.outlierDaysData.length > 0 && (
                                <div className="mt-3 pt-2 border-t border-muted">
                                  <p className="text-xs font-medium mb-2">
                                    Outlier Dates:
                                  </p>
                                  <div className="space-y-1 max-h-32 overflow-y-auto">
                                    {details.outlierDaysData.map(
                                      (outlier, index) => (
                                        <div
                                          key={index}
                                          className="text-xs bg-muted/50 rounded px-2 py-1"
                                        >
                                          <span className="font-medium">
                                            {new Date(
                                              outlier[0],
                                            ).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </span>
                                          <span className="text-muted-foreground ml-2">
                                            ({outlier[1]} emails)
                                          </span>
                                        </div>
                                      ),
                                    )}
                                  </div>
                                </div>
                              )}
                              <p className="text-xs text-muted-foreground mt-2">
                                Days with unusually high email volume ({">"}2σ
                                above mean)
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No data available
                            </p>
                          );
                        })()}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <HoverCard>
                    {" "}
                    <HoverCardTrigger asChild>
                      <div className="cursor-help">
                        <div className="text-lg font-bold text-primary">
                          {outlierAnalysis.topSender}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Top Sender Outlier
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Sender Outlier Analysis
                        </h4>
                        {(() => {
                          const { details } = outlierAnalysis;
                          return details &&
                            details.isTopSenderOutlier &&
                            details.topSenderData ? (
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Sender:</strong>{" "}
                                {details.topSenderData[0]}
                              </p>
                              <p>
                                <strong>Email count:</strong>{" "}
                                {details.topSenderData[1]}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Sender with unusually high email volume compared
                                to others
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No sender significantly exceeds normal patterns
                            </p>
                          );
                        })()}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
                <div className="bg-muted/50 rounded-lg p-4 text-center">
                  <HoverCard>
                    {" "}
                    <HoverCardTrigger asChild>
                      <div className="cursor-help">
                        <div className="text-2xl font-bold text-primary">
                          {outlierAnalysis.unusualPatterns}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Unusual Hours
                        </div>
                      </div>
                    </HoverCardTrigger>
                    <HoverCardContent className="w-80">
                      <div className="space-y-2">
                        <h4 className="text-sm font-semibold">
                          Unusual Time Patterns
                        </h4>
                        {(() => {
                          const { details } = outlierAnalysis;
                          return details ? (
                            <div className="text-sm space-y-1">
                              <p>
                                <strong>Late night emails:</strong>{" "}
                                {details.unusualHourEmails}
                              </p>
                              <p>
                                <strong>Total emails:</strong>{" "}
                                {details.totalEmails}
                              </p>
                              <p className="text-xs text-muted-foreground mt-2">
                                Percentage of emails received during unusual
                                hours (11PM-5AM)
                              </p>
                            </div>
                          ) : (
                            <p className="text-sm text-muted-foreground">
                              No data available
                            </p>
                          );
                        })()}
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                </div>
              </div>
            </div>{" "}
            {/* Emails per Day Chart */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-4 w-4" />
                <h4 className="font-medium">Emails per Day (Last 14 Days)</h4>
              </div>{" "}
              <ChartContainer config={chartConfig} className="h-[200px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={emailsByDay}>
                    <XAxis
                      dataKey="day"
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <YAxis
                      tick={{ fontSize: 12 }}
                      tickLine={false}
                      axisLine={false}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          labelFormatter={(label) => `${label}`}
                          formatter={(value, name) => [
                            value,
                            name === "count" ? "Emails" : name,
                          ]}
                        />
                      }
                    />
                    <Bar
                      dataKey="count"
                      fill="var(--color-count)"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </div>{" "}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium">
                  {showAllSenders
                    ? "All Senders by Institution"
                    : "Top Senders"}
                </h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowAllSenders(!showAllSenders)}
                  className="text-xs"
                >
                  {showAllSenders ? "Show Top 5" : "Show All by Institution"}
                </Button>
              </div>{" "}
              <div className="space-y-2 max-h-80 overflow-y-auto">
                {!showAllSenders
                  ? // Show top 5 senders (existing logic)
                    Object.entries(
                      emails.reduce(
                        (
                          acc: Record<
                            string,
                            { count: number; email: string; name: string }
                          >,
                          email,
                        ) => {
                          const sender = getHeader(
                            getEmailHeaders(email),
                            "From",
                          );
                          const senderEmail = sender.match(/<(.+?)>/)
                            ? sender.match(/<(.+?)>/)![1]
                            : sender;
                          const senderName = sender.match(/^([^<]+)/)
                            ? sender
                                .match(/^([^<]+)/)![1]
                                .trim()
                                .replace(/"/g, "")
                            : senderEmail;

                          // Use email as the key to group by unique email addresses
                          const key = senderEmail;

                          if (!acc[key]) {
                            acc[key] = {
                              count: 0,
                              email: senderEmail,
                              name: senderName,
                            };
                          }
                          acc[key].count += 1;
                          return acc;
                        },
                        {},
                      ),
                    )
                      .sort(([, a], [, b]) => b.count - a.count)
                      .slice(0, 5)
                      .map(([senderEmail, senderData]) => (
                        <div
                          key={senderEmail}
                          className="flex items-center justify-between p-2 bg-muted/30 rounded"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">
                              {senderData.name !== senderData.email
                                ? senderData.name
                                : ""}
                            </div>
                            <div className="text-xs text-muted-foreground truncate">
                              {senderData.email}
                            </div>
                          </div>
                          <Badge variant="secondary" className="ml-2 shrink-0">
                            {senderData.count}
                          </Badge>
                        </div>
                      ))
                  : // Show all senders grouped by institution
                    (() => {
                      // Create sender data structure
                      const senderData = emails.reduce(
                        (
                          acc: Record<
                            string,
                            { count: number; email: string; name: string }
                          >,
                          email,
                        ) => {
                          const sender = getHeader(
                            getEmailHeaders(email),
                            "From",
                          );
                          const senderEmail = sender.match(/<(.+?)>/)
                            ? sender.match(/<(.+?)>/)![1]
                            : sender;
                          const senderName = sender.match(/^([^<]+)/)
                            ? sender
                                .match(/^([^<]+)/)![1]
                                .trim()
                                .replace(/"/g, "")
                            : senderEmail;

                          const key = senderEmail;
                          if (!acc[key]) {
                            acc[key] = {
                              count: 0,
                              email: senderEmail,
                              name: senderName,
                            };
                          }
                          acc[key].count += 1;
                          return acc;
                        },
                        {},
                      );

                      // Group senders by institution
                      const institutionGroups: Record<
                        string,
                        Array<{ email: string; name: string; count: number }>
                      > = {};
                      const ungroupedSenders: Array<{
                        email: string;
                        name: string;
                        count: number;
                      }> = [];

                      Object.entries(senderData).forEach(([email, data]) => {
                        let assigned = false;

                        for (const institution of selectedSenders) {
                          const emailLower = email.toLowerCase();
                          const institutionLower = institution.toLowerCase();

                          // Special case: When checking for "Inter", exclude Pinterest and Auditoria Interna emails
                          if (institutionLower === "inter") {
                            if (
                              emailLower.includes("@discover.pinterest.com") ||
                              emailLower.includes("auditoria interna")
                            ) {
                              continue;
                            }
                          }
                          // Check if email matches institution
                          let matches = false;

                          // Enhanced matching logic for specific institutions
                          switch (institutionLower) {
                            case "inter":
                              matches =
                                emailLower.includes("inter") ||
                                emailLower.includes("bancointer") ||
                                data.name.toLowerCase().includes("inter");
                              break;
                            case "handelsbanken":
                              matches =
                                emailLower.includes("handelsbanken") ||
                                emailLower.includes("shb.se") ||
                                data.name
                                  .toLowerCase()
                                  .includes("handelsbanken");
                              break;
                            case "sj prio mastercard":
                              matches =
                                emailLower.includes("sj") ||
                                emailLower.includes("prio") ||
                                emailLower.includes("mastercard") ||
                                data.name.toLowerCase().includes("sj") ||
                                data.name.toLowerCase().includes("prio");
                              break;
                            case "american express":
                              matches =
                                emailLower.includes("americanexpress") ||
                                emailLower.includes("amex") ||
                                emailLower.includes("american-express") ||
                                data.name
                                  .toLowerCase()
                                  .includes("american express") ||
                                data.name.toLowerCase().includes("amex");
                              break;
                            case "clear":
                              matches =
                                emailLower.includes("clear") ||
                                emailLower.includes("clearinvest") ||
                                data.name.toLowerCase().includes("clear");
                              break;
                            case "rico":
                              matches =
                                emailLower.includes("rico") ||
                                emailLower.includes("riconnect") ||
                                data.name.toLowerCase().includes("rico");
                              break;
                            case "cartões riachuelo":
                              matches =
                                emailLower.includes("riachuelo") ||
                                emailLower.includes("cartao") ||
                                data.name.toLowerCase().includes("riachuelo") ||
                                data.name.toLowerCase().includes("cartão");
                              break;
                            default:
                              // Generic matching for other institutions
                              matches =
                                emailLower.includes(institutionLower) ||
                                data.name
                                  .toLowerCase()
                                  .includes(institutionLower);
                          }

                          if (matches) {
                            if (!institutionGroups[institution]) {
                              institutionGroups[institution] = [];
                            }
                            institutionGroups[institution].push(data);
                            assigned = true;
                            break;
                          }
                        }

                        if (!assigned) {
                          ungroupedSenders.push(data);
                        }
                      });

                      // Sort each institution group by email count
                      Object.keys(institutionGroups).forEach((institution) => {
                        institutionGroups[institution].sort(
                          (a, b) => b.count - a.count,
                        );
                      });

                      // Sort ungrouped senders by count
                      ungroupedSenders.sort((a, b) => b.count - a.count);

                      return (
                        <div className="space-y-4">
                          {/* Institution Groups */}
                          {selectedSenders.map((institution) => {
                            const institutionSenders =
                              institutionGroups[institution];
                            if (
                              !institutionSenders ||
                              institutionSenders.length === 0
                            )
                              return null;

                            const totalEmails = institutionSenders.reduce(
                              (sum, sender) => sum + sender.count,
                              0,
                            );

                            return (
                              <div key={institution} className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <h5 className="font-semibold text-sm text-primary flex items-center gap-2">
                                    <Building2 className="h-4 w-4" />
                                    {institution}
                                  </h5>
                                  <Badge variant="outline" className="text-xs">
                                    {institutionSenders.length} email
                                    {institutionSenders.length !== 1
                                      ? " addresses"
                                      : " address"}{" "}
                                    • {totalEmails} emails
                                  </Badge>
                                </div>
                                <div className="pl-6 space-y-1">
                                  {institutionSenders.map((sender, index) => (
                                    <div
                                      key={`${institution}-${sender.email}-${index}`}
                                      className="flex items-center justify-between p-2 bg-muted/20 rounded border-l-2 border-primary/30"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">
                                          {sender.name !== sender.email
                                            ? sender.name
                                            : ""}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                          {sender.email}
                                        </div>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 shrink-0"
                                      >
                                        {sender.count}
                                      </Badge>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            );
                          })}

                          {/* Other Senders */}
                          {ungroupedSenders.length > 0 && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <h5 className="font-semibold text-sm text-muted-foreground flex items-center gap-2">
                                  <Mail className="h-4 w-4" />
                                  Other Senders
                                </h5>
                                <Badge variant="outline" className="text-xs">
                                  {ungroupedSenders.length} email
                                  {ungroupedSenders.length !== 1
                                    ? " addresses"
                                    : " address"}
                                </Badge>
                              </div>
                              <div className="pl-6 space-y-1">
                                {ungroupedSenders
                                  .slice(0, 10)
                                  .map((sender, index) => (
                                    <div
                                      key={`other-${sender.email}-${index}`}
                                      className="flex items-center justify-between p-2 bg-muted/10 rounded"
                                    >
                                      <div className="flex-1 min-w-0">
                                        <div className="font-medium text-sm truncate">
                                          {sender.name !== sender.email
                                            ? sender.name
                                            : ""}
                                        </div>
                                        <div className="text-xs text-muted-foreground truncate">
                                          {sender.email}
                                        </div>
                                      </div>
                                      <Badge
                                        variant="secondary"
                                        className="ml-2 shrink-0"
                                      >
                                        {sender.count}
                                      </Badge>
                                    </div>
                                  ))}
                                {ungroupedSenders.length > 10 && (
                                  <div className="text-xs text-muted-foreground text-center py-2">
                                    ... and {ungroupedSenders.length - 10} more
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })()}
              </div>
              {showAllSenders && (
                <div className="mt-2 text-xs text-muted-foreground text-center">
                  Showing all{" "}
                  {
                    new Set(
                      emails.map((email) =>
                        getHeader(getEmailHeaders(email), "From"),
                      ),
                    ).size
                  }{" "}
                  unique senders grouped by institution
                </div>
              )}
            </div>{" "}
          </CardContent>
        </Card>
      )}
      {(isSignedIn || offlineMode) && emails.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Filter className="h-5 w-5" />
              Emails from Financial Institutions
            </CardTitle>
            <CardDescription>
              Organized by institution: {selectedSenders.join(", ")}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {" "}
              {selectedSenders.map((organization) => {
                const organizationEmails = emails.filter((email) => {
                  const sender = getHeader(getEmailHeaders(email), "From");
                  const senderLower = sender.toLowerCase();
                  const orgLower = organization.toLowerCase();

                  // Special case: When filtering for "Inter", exclude Pinterest and Auditoria Interna emails
                  if (orgLower === "inter") {
                    if (
                      senderLower.includes("@discover.pinterest.com") ||
                      senderLower.includes("auditoria interna")
                    ) {
                      return false;
                    }
                  }

                  return senderLower.includes(orgLower);
                });

                if (organizationEmails.length === 0) return null; // Get appropriate icon for each organization
                const getOrganizationIcon = (org: string) => {
                  const orgLower = org.toLowerCase();
                  if (
                    orgLower.includes("inter") ||
                    orgLower.includes("handelsbanken")
                  ) {
                    return <Building2 className="w-4 h-4" />;
                  } else if (
                    orgLower.includes("american express") ||
                    orgLower.includes("mastercard") ||
                    orgLower.includes("cartões riachuelo") ||
                    orgLower.includes("sj prio")
                  ) {
                    return <CreditCard className="w-4 h-4" />;
                  } else if (
                    orgLower.includes("seb") ||
                    orgLower.includes("clear") ||
                    orgLower.includes("rico")
                  ) {
                    return <Banknote className="w-4 h-4" />;
                  }
                  return <Mail className="w-4 h-4" />;
                };

                // Special handling for Inter organization with subsections
                if (organization.toLowerCase() === "inter") {
                  // Filter emails into subsections
                  const faturaCartaoEmails = organizationEmails.filter(
                    (email) => {
                      const subject = getHeader(
                        getEmailHeaders(email),
                        "Subject",
                      );
                      return (
                        subject.toLowerCase().includes("fatura") &&
                        subject.toLowerCase().includes("cartão")
                      );
                    },
                  );

                  const otherInterEmails = organizationEmails.filter(
                    (email) => {
                      const subject = getHeader(
                        getEmailHeaders(email),
                        "Subject",
                      );
                      return !(
                        subject.toLowerCase().includes("fatura") &&
                        subject.toLowerCase().includes("cartão")
                      );
                    },
                  );

                  return (
                    <div key={organization} className="space-y-3">
                      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                        <h4 className="font-semibold text-lg flex items-center gap-3">
                          <div className="flex items-center gap-2 text-primary">
                            {getOrganizationIcon(organization)}
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          {organization}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {organizationEmails.length} email
                          {organizationEmails.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Fatura Cartão Inter Subsection */}
                      {faturaCartaoEmails.length > 0 && (
                        <div className="ml-4 space-y-3">
                          <div className="flex items-center justify-between bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 border border-blue-200 dark:border-blue-800">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              <CreditCard className="w-3 h-3 text-blue-600" />
                              Fatura Cartão Inter
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {faturaCartaoEmails.length} email
                              {faturaCartaoEmails.length !== 1 ? "s" : ""}
                            </Badge>{" "}
                          </div>{" "}
                          <div className="space-y-3 ml-2 pl-2 border-l-2 border-blue-300/50">
                            {faturaCartaoEmails
                              .slice(
                                0,
                                getEmailsToShow(`${organization}-fatura`),
                              )
                              .map((email) => {
                                const headers = getEmailHeaders(email);
                                const subject = getHeader(headers, "Subject");
                                const from = getHeader(headers, "From");
                                const date = getHeader(headers, "Date");

                                return (
                                  <div
                                    key={email.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                                    onClick={() =>
                                      toggleEmailExpansion(email.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium truncate text-sm">
                                          {subject || "No Subject"}
                                        </h6>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {from}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDate(date)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {expandedEmails.has(email.id) && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {email.snippet}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                            {/* Pagination for Fatura Cartão */}
                            {faturaCartaoEmails.length > 5 && (
                              <div className="flex items-center justify-center gap-3 py-4">
                                <Badge variant="outline" className="text-xs">
                                  Showing{" "}
                                  {getEmailsToShow(`${organization}-fatura`)} of{" "}
                                  {faturaCartaoEmails.length} emails
                                </Badge>
                                <div className="flex gap-2">
                                  {getEmailsToShow(`${organization}-fatura`) <
                                    faturaCartaoEmails.length && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showMoreEmails(
                                          `${organization}-fatura`,
                                          faturaCartaoEmails.length,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show More
                                    </Button>
                                  )}
                                  {getEmailsToShow(`${organization}-fatura`) >
                                    5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showFewerEmails(
                                          `${organization}-fatura`,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show Less
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Other Inter Emails Subsection */}
                      {otherInterEmails.length > 0 && (
                        <div className="ml-4 space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-600" />
                              Other
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {otherInterEmails.length} email
                              {otherInterEmails.length !== 1 ? "s" : ""}
                            </Badge>{" "}
                          </div>{" "}
                          <div className="space-y-3 ml-2 pl-2 border-l-2 border-gray-300/50">
                            {otherInterEmails
                              .slice(
                                0,
                                getEmailsToShow(`${organization}-other`),
                              )
                              .map((email) => {
                                const headers = getEmailHeaders(email);
                                const subject = getHeader(headers, "Subject");
                                const from = getHeader(headers, "From");
                                const date = getHeader(headers, "Date");

                                return (
                                  <div
                                    key={email.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                                    onClick={() =>
                                      toggleEmailExpansion(email.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium truncate text-sm">
                                          {subject || "No Subject"}
                                        </h6>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {from}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDate(date)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {expandedEmails.has(email.id) && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {email.snippet}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                            {/* Pagination for Other Inter emails */}
                            {otherInterEmails.length > 5 && (
                              <div className="flex items-center justify-center gap-3 py-4">
                                <Badge variant="outline" className="text-xs">
                                  Showing{" "}
                                  {getEmailsToShow(`${organization}-other`)} of{" "}
                                  {otherInterEmails.length} emails
                                </Badge>
                                <div className="flex gap-2">
                                  {getEmailsToShow(`${organization}-other`) <
                                    otherInterEmails.length && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showMoreEmails(
                                          `${organization}-other`,
                                          otherInterEmails.length,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show More
                                    </Button>
                                  )}
                                  {getEmailsToShow(`${organization}-other`) >
                                    5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showFewerEmails(`${organization}-other`)
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show Less
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Special handling for Rico organization with subsections
                if (organization.toLowerCase() === "rico") {
                  // Filter emails into subsections
                  const cartaoRicoFaturaEmails = organizationEmails.filter(
                    (email) => {
                      const subject = getHeader(
                        getEmailHeaders(email),
                        "Subject",
                      );
                      const from = getHeader(getEmailHeaders(email), "From");
                      return (
                        subject.toLowerCase().includes("fatura") &&
                        from.toLowerCase().includes("fatura")
                      );
                    },
                  );

                  const otherRicoEmails = organizationEmails.filter((email) => {
                    const subject = getHeader(
                      getEmailHeaders(email),
                      "Subject",
                    );
                    const from = getHeader(getEmailHeaders(email), "From");
                    return !(
                      (subject.toLowerCase().includes("fatura") ||
                        from.toLowerCase().includes("cartão rico")) &&
                      (subject.toLowerCase().includes("cartão") ||
                        from.toLowerCase().includes("cartão"))
                    );
                  });

                  return (
                    <div key={organization} className="space-y-3">
                      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                        <h4 className="font-semibold text-lg flex items-center gap-3">
                          <div className="flex items-center gap-2 text-primary">
                            {getOrganizationIcon(organization)}
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          {organization}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {organizationEmails.length} email
                          {organizationEmails.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Cartão Rico - Fatura Subsection */}
                      {cartaoRicoFaturaEmails.length > 0 && (
                        <div className="ml-4 space-y-3">
                          <div className="flex items-center justify-between bg-orange-50 dark:bg-orange-900/20 rounded-lg p-2 border border-orange-200 dark:border-orange-800">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              <CreditCard className="w-3 h-3 text-orange-600" />
                              Cartão Rico - Fatura
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {cartaoRicoFaturaEmails.length} email
                              {cartaoRicoFaturaEmails.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>{" "}
                          <div className="space-y-3 ml-2 pl-2 border-l-2 border-orange-300/50">
                            {cartaoRicoFaturaEmails
                              .slice(
                                0,
                                getEmailsToShow(
                                  `${organization}-cartao-fatura`,
                                ),
                              )
                              .map((email) => {
                                const headers = getEmailHeaders(email);
                                const subject = getHeader(headers, "Subject");
                                const from = getHeader(headers, "From");
                                const date = getHeader(headers, "Date");

                                return (
                                  <div
                                    key={email.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                                    onClick={() =>
                                      toggleEmailExpansion(email.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium truncate text-sm">
                                          {subject || "No Subject"}
                                        </h6>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {from}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDate(date)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {expandedEmails.has(email.id) && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {email.snippet}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                            {/* Pagination for Cartão Rico - Fatura */}
                            {cartaoRicoFaturaEmails.length > 5 && (
                              <div className="flex items-center justify-center gap-3 py-4">
                                <Badge variant="outline" className="text-xs">
                                  Showing{" "}
                                  {getEmailsToShow(
                                    `${organization}-cartao-fatura`,
                                  )}{" "}
                                  of {cartaoRicoFaturaEmails.length} emails
                                </Badge>
                                <div className="flex gap-2">
                                  {getEmailsToShow(
                                    `${organization}-cartao-fatura`,
                                  ) < cartaoRicoFaturaEmails.length && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showMoreEmails(
                                          `${organization}-cartao-fatura`,
                                          cartaoRicoFaturaEmails.length,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show More
                                    </Button>
                                  )}
                                  {getEmailsToShow(
                                    `${organization}-cartao-fatura`,
                                  ) > 5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showFewerEmails(
                                          `${organization}-cartao-fatura`,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show Less
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Other Rico Emails Subsection */}
                      {otherRicoEmails.length > 0 && (
                        <div className="ml-4 space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-600" />
                              Other
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {otherRicoEmails.length} email
                              {otherRicoEmails.length !== 1 ? "s" : ""}
                            </Badge>{" "}
                          </div>{" "}
                          <div className="space-y-3 ml-2 pl-2 border-l-2 border-gray-300/50">
                            {otherRicoEmails
                              .slice(
                                0,
                                getEmailsToShow(`${organization}-other`),
                              )
                              .map((email) => {
                                const headers = getEmailHeaders(email);
                                const subject = getHeader(headers, "Subject");
                                const from = getHeader(headers, "From");
                                const date = getHeader(headers, "Date");

                                return (
                                  <div
                                    key={email.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                                    onClick={() =>
                                      toggleEmailExpansion(email.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium truncate text-sm">
                                          {subject || "No Subject"}
                                        </h6>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {from}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDate(date)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {expandedEmails.has(email.id) && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {email.snippet}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}

                            {/* Pagination for Other Rico emails */}
                            {otherRicoEmails.length > 5 && (
                              <div className="flex items-center justify-center gap-3 py-4">
                                <Badge variant="outline" className="text-xs">
                                  Showing{" "}
                                  {getEmailsToShow(`${organization}-other`)} of{" "}
                                  {otherRicoEmails.length} emails
                                </Badge>
                                <div className="flex gap-2">
                                  {getEmailsToShow(`${organization}-other`) <
                                    otherRicoEmails.length && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showMoreEmails(
                                          `${organization}-other`,
                                          otherRicoEmails.length,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show More
                                    </Button>
                                  )}
                                  {getEmailsToShow(`${organization}-other`) >
                                    5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showFewerEmails(`${organization}-other`)
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show Less
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Special handling for American Express organization with subsections
                if (organization.toLowerCase() === "american express") {
                  // Filter emails into subsections
                  const dinFakturaEmails = organizationEmails.filter(
                    (email) => {
                      const subject = getHeader(
                        getEmailHeaders(email),
                        "Subject",
                      );
                      return subject.toLowerCase().includes("din faktura");
                    },
                  );

                  const otherAmexEmails = organizationEmails.filter((email) => {
                    const subject = getHeader(
                      getEmailHeaders(email),
                      "Subject",
                    );
                    return !subject.toLowerCase().includes("din faktura");
                  });

                  return (
                    <div key={organization} className="space-y-3">
                      <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                        <h4 className="font-semibold text-lg flex items-center gap-3">
                          <div className="flex items-center gap-2 text-primary">
                            {getOrganizationIcon(organization)}
                            <div className="w-2 h-2 bg-primary rounded-full"></div>
                          </div>
                          {organization}
                        </h4>
                        <Badge variant="outline" className="text-xs">
                          {organizationEmails.length} email
                          {organizationEmails.length !== 1 ? "s" : ""}
                        </Badge>
                      </div>

                      {/* Din faktura Subsection */}
                      {dinFakturaEmails.length > 0 && (
                        <div className="ml-4 space-y-3">
                          <div className="flex items-center justify-between bg-green-50 dark:bg-green-900/20 rounded-lg p-2 border border-green-200 dark:border-green-800">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              <CreditCard className="w-3 h-3 text-green-600" />
                              Din faktura
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {dinFakturaEmails.length} email
                              {dinFakturaEmails.length !== 1 ? "s" : ""}
                            </Badge>{" "}
                          </div>

                          <div className="space-y-3 ml-2 pl-2 border-l-2 border-green-300/50">
                            {" "}
                            {dinFakturaEmails
                              .slice(
                                0,
                                getEmailsToShow(`${organization}-din-faktura`),
                              )
                              .map((email) => {
                                const headers = getEmailHeaders(email);
                                const subject = getHeader(headers, "Subject");
                                const from = getHeader(headers, "From");
                                const date = getHeader(headers, "Date");

                                return (
                                  <div
                                    key={email.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                                    onClick={() =>
                                      toggleEmailExpansion(email.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium truncate text-sm">
                                          {subject || "No Subject"}
                                        </h6>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {from}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDate(date)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {expandedEmails.has(email.id) && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {email.snippet}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            {/* Pagination for Din faktura */}
                            {dinFakturaEmails.length > 5 && (
                              <div className="flex items-center justify-center gap-3 py-4">
                                <Badge variant="outline" className="text-xs">
                                  Showing{" "}
                                  {getEmailsToShow(
                                    `${organization}-din-faktura`,
                                  )}{" "}
                                  of {dinFakturaEmails.length} emails
                                </Badge>
                                <div className="flex gap-2">
                                  {getEmailsToShow(
                                    `${organization}-din-faktura`,
                                  ) < dinFakturaEmails.length && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showMoreEmails(
                                          `${organization}-din-faktura`,
                                          dinFakturaEmails.length,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show More
                                    </Button>
                                  )}
                                  {getEmailsToShow(
                                    `${organization}-din-faktura`,
                                  ) > 5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showFewerEmails(
                                          `${organization}-din-faktura`,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show Less
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Other American Express Emails Subsection */}
                      {otherAmexEmails.length > 0 && (
                        <div className="ml-4 space-y-3">
                          <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-900/20 rounded-lg p-2 border border-gray-200 dark:border-gray-800">
                            <h5 className="font-medium text-sm flex items-center gap-2">
                              <Mail className="w-3 h-3 text-gray-600" />
                              Other
                            </h5>
                            <Badge variant="secondary" className="text-xs">
                              {otherAmexEmails.length} email
                              {otherAmexEmails.length !== 1 ? "s" : ""}
                            </Badge>
                          </div>{" "}
                          <div className="space-y-3 ml-2 pl-2 border-l-2 border-gray-300/50">
                            {" "}
                            {otherAmexEmails
                              .slice(
                                0,
                                getEmailsToShow(`${organization}-other`),
                              )
                              .map((email) => {
                                const headers = getEmailHeaders(email);
                                const subject = getHeader(headers, "Subject");
                                const from = getHeader(headers, "From");
                                const date = getHeader(headers, "Date");

                                return (
                                  <div
                                    key={email.id}
                                    className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                                    onClick={() =>
                                      toggleEmailExpansion(email.id)
                                    }
                                  >
                                    <div className="flex items-start justify-between mb-2">
                                      <div className="flex-1 min-w-0">
                                        <h6 className="font-medium truncate text-sm">
                                          {subject || "No Subject"}
                                        </h6>
                                        <p className="text-xs text-muted-foreground truncate">
                                          {from}
                                        </p>
                                      </div>
                                      <div className="flex items-center gap-2 ml-4">
                                        <Badge
                                          variant="secondary"
                                          className="text-xs"
                                        >
                                          <Calendar className="w-3 h-3 mr-1" />
                                          {formatDate(date)}
                                        </Badge>
                                      </div>
                                    </div>
                                    {expandedEmails.has(email.id) && (
                                      <p className="text-xs text-muted-foreground line-clamp-2">
                                        {email.snippet}
                                      </p>
                                    )}
                                  </div>
                                );
                              })}
                            {/* Pagination for Other American Express emails */}
                            {otherAmexEmails.length > 5 && (
                              <div className="flex items-center justify-center gap-3 py-4">
                                <Badge variant="outline" className="text-xs">
                                  Showing{" "}
                                  {getEmailsToShow(`${organization}-other`)} of{" "}
                                  {otherAmexEmails.length} emails
                                </Badge>
                                <div className="flex gap-2">
                                  {getEmailsToShow(`${organization}-other`) <
                                    otherAmexEmails.length && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showMoreEmails(
                                          `${organization}-other`,
                                          otherAmexEmails.length,
                                        )
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show More
                                    </Button>
                                  )}
                                  {getEmailsToShow(`${organization}-other`) >
                                    5 && (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={() =>
                                        showFewerEmails(`${organization}-other`)
                                      }
                                      className="text-xs h-7"
                                    >
                                      Show Less
                                    </Button>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                }

                // Default organization display (for non-Inter/Rico/American Express organizations)
                return (
                  <div key={organization} className="space-y-3">
                    <div className="flex items-center justify-between bg-muted/30 rounded-lg p-3">
                      <h4 className="font-semibold text-lg flex items-center gap-3">
                        <div className="flex items-center gap-2 text-primary">
                          {getOrganizationIcon(organization)}
                          <div className="w-2 h-2 bg-primary rounded-full"></div>
                        </div>
                        {organization}
                      </h4>
                      <Badge variant="outline" className="text-xs">
                        {organizationEmails.length} email
                        {organizationEmails.length !== 1 ? "s" : ""}
                      </Badge>{" "}
                    </div>{" "}
                    <div className="space-y-3 ml-4 pl-2 border-l-2 border-primary/20">
                      {organizationEmails
                        .slice(0, getEmailsToShow(organization))
                        .map((email) => {
                          const headers = getEmailHeaders(email);
                          const subject = getHeader(headers, "Subject");
                          const from = getHeader(headers, "From");
                          const date = getHeader(headers, "Date");

                          return (
                            <div
                              key={email.id}
                              className="border rounded-lg p-3 hover:bg-muted/50 transition-colors bg-background shadow-sm cursor-pointer"
                              onClick={() => toggleEmailExpansion(email.id)}
                            >
                              <div className="flex items-start justify-between mb-2">
                                <div className="flex-1 min-w-0">
                                  <h5 className="font-medium truncate text-sm">
                                    {subject || "No Subject"}
                                  </h5>
                                  <p className="text-xs text-muted-foreground truncate">
                                    {from}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2 ml-4">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    <Calendar className="w-3 h-3 mr-1" />
                                    {formatDate(date)}
                                  </Badge>
                                </div>
                              </div>
                              {expandedEmails.has(email.id) && (
                                <p className="text-xs text-muted-foreground line-clamp-2">
                                  {email.snippet}
                                </p>
                              )}
                            </div>
                          );
                        })}

                      {/* Pagination controls */}
                      {organizationEmails.length > 5 && (
                        <div className="flex items-center justify-center gap-3 py-4">
                          <Badge variant="outline" className="text-xs">
                            Showing {getEmailsToShow(organization)} of{" "}
                            {organizationEmails.length} emails
                          </Badge>
                          <div className="flex gap-2">
                            {getEmailsToShow(organization) <
                              organizationEmails.length && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() =>
                                  showMoreEmails(
                                    organization,
                                    organizationEmails.length,
                                  )
                                }
                                className="text-xs h-7"
                              >
                                Show More
                              </Button>
                            )}
                            {getEmailsToShow(organization) > 5 && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => showFewerEmails(organization)}
                                className="text-xs h-7"
                              >
                                Show Less
                              </Button>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              {selectedSenders.every((organization) => {
                const organizationEmails = emails.filter((email) => {
                  const sender = getHeader(getEmailHeaders(email), "From");
                  return sender
                    .toLowerCase()
                    .includes(organization.toLowerCase());
                });
                return organizationEmails.length === 0;
              }) && (
                <div className="text-center py-8 text-muted-foreground">
                  No emails found from any of the selected financial
                  institutions.
                </div>
              )}
            </div>
          </CardContent>{" "}
        </Card>
      )}
      {/* Upload Mode Information Card */}
      {(isSignedIn || offlineMode) &&
        dataSource === "upload" &&
        !uploadedFile && (
          <Card className="mb-6">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <Upload className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">
                  Upload Mode Selected
                </h3>
                <p className="text-muted-foreground mb-4">
                  Upload a previously exported JSON file to view and analyze
                  your email data. The file should contain emails exported from
                  this application.
                </p>{" "}
                <p className="text-sm text-muted-foreground">
                  Go to the &quot;Data Source&quot; section above to upload your
                  JSON file.
                </p>
              </div>
            </CardContent>
          </Card>
        )}
      {(isSignedIn || offlineMode) &&
        !(dataSource === "upload" && !showAllUploadSenders) && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Mail className="h-5 w-5" />
                  Recent Emails ({emails.length})
                </CardTitle>
                {emails.length > 0 && (
                  <Button
                    onClick={exportCurrentEmails}
                    size="sm"
                    variant="outline"
                    className="gap-2"
                  >
                    <Download className="h-4 w-4" />
                    Export All
                  </Button>
                )}
              </div>
              <CardDescription className="flex items-center justify-between">
                <span>
                  Your {dataSource === "upload" ? "uploaded" : "latest Gmail"}{" "}
                  messages
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    id="hide-ignored"
                    checked={hideIgnored}
                    onCheckedChange={setHideIgnored}
                  />
                  <label
                    htmlFor="hide-ignored"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Hide ignored ({ignoredEmails.size})
                  </label>
                </div>
              </CardDescription>
            </CardHeader>{" "}
            <CardContent>
              {loading || isLoadingFromCache ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="h-8 w-8 animate-spin" />{" "}
                  <span className="ml-2">
                    {isLoadingFromCache
                      ? "Loading cached emails..."
                      : dataSource === "upload"
                        ? "Processing uploaded file..."
                        : "Loading emails..."}
                  </span>
                </div>
              ) : emails.length > 0 ? (
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                  {/* Side Navigation Panel */}
                  <div className="lg:col-span-1 border-r pr-4">
                    <div className="space-y-2">
                      {/* All Emails Option */}
                      <button
                        onClick={() => setSelectedDateFilter({ type: "all" })}
                        className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                          selectedDateFilter.type === "all"
                            ? "bg-primary text-primary-foreground"
                            : "hover:bg-muted"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-medium">
                            All Emails
                          </span>
                          <Badge variant="secondary" className="text-xs">
                            {emails.length}
                          </Badge>
                        </div>
                      </button>

                      {/* Date Hierarchy Navigation */}
                      <div className="space-y-1">
                        {Object.keys(emailsByDateHierarchy)
                          .sort((a, b) => parseInt(b) - parseInt(a))
                          .map((year) => {
                            const yearData = emailsByDateHierarchy[year];
                            const months = Object.keys(yearData)
                              .sort()
                              .reverse();

                            return (
                              <div key={year} className="space-y-1">
                                <div className="text-xs font-semibold text-muted-foreground px-3 py-1">
                                  {year}
                                </div>
                                <Accordion
                                  type="multiple"
                                  value={expandedMonths}
                                  onValueChange={setExpandedMonths}
                                >
                                  {months.map((monthId) => {
                                    const monthData = yearData[monthId];
                                    const weeks = Object.keys(monthData).sort();
                                    const monthDate = new Date(monthId + "-01");
                                    const monthName =
                                      monthDate.toLocaleDateString("en-US", {
                                        month: "long",
                                      });
                                    const monthEmailCount = Object.values(
                                      monthData,
                                    )
                                      .flatMap((week) => Object.values(week))
                                      .flatMap((day) => day).length;

                                    return (
                                      <AccordionItem
                                        key={monthId}
                                        value={monthId}
                                        className="border-none"
                                      >
                                        <AccordionTrigger
                                          className={`px-3 py-2 hover:no-underline hover:bg-muted rounded-md ${
                                            selectedDateFilter.type ===
                                              "month" &&
                                            selectedDateFilter.value === monthId
                                              ? "bg-primary/10"
                                              : ""
                                          }`}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setSelectedDateFilter({
                                              type: "month",
                                              value: monthId,
                                            });
                                          }}
                                        >
                                          <div className="flex items-center justify-between w-full mr-2">
                                            <span className="text-sm font-medium">
                                              {monthName}
                                            </span>
                                            <Badge
                                              variant="secondary"
                                              className="text-xs"
                                            >
                                              {monthEmailCount}
                                            </Badge>
                                          </div>
                                        </AccordionTrigger>
                                        <AccordionContent className="pb-0 pt-1">
                                          <Accordion
                                            type="multiple"
                                            value={expandedWeeks}
                                            onValueChange={setExpandedWeeks}
                                          >
                                            {weeks.map((weekId) => {
                                              const weekData =
                                                monthData[weekId];
                                              const days =
                                                Object.keys(weekData).sort();
                                              const weekNumber =
                                                weekId.split("-W")[1];
                                              const weekEmailCount =
                                                Object.values(weekData).flatMap(
                                                  (day) => day,
                                                ).length;

                                              return (
                                                <AccordionItem
                                                  key={weekId}
                                                  value={weekId}
                                                  className="border-none ml-2"
                                                >
                                                  <AccordionTrigger
                                                    className={`px-3 py-1.5 hover:no-underline hover:bg-muted rounded-md text-xs ${
                                                      selectedDateFilter.type ===
                                                        "week" &&
                                                      selectedDateFilter.value ===
                                                        weekId
                                                        ? "bg-primary/10"
                                                        : ""
                                                    }`}
                                                    onClick={(e) => {
                                                      e.stopPropagation();
                                                      setSelectedDateFilter({
                                                        type: "week",
                                                        value: weekId,
                                                      });
                                                    }}
                                                  >
                                                    <div className="flex items-center justify-between w-full mr-2">
                                                      <span>
                                                        Week {weekNumber}
                                                      </span>
                                                      <Badge
                                                        variant="outline"
                                                        className="text-xs"
                                                      >
                                                        {weekEmailCount}
                                                      </Badge>
                                                    </div>
                                                  </AccordionTrigger>
                                                  <AccordionContent className="pb-0 pt-1">
                                                    <div className="space-y-0.5 ml-2">
                                                      {days.map((dayId) => {
                                                        const dayEmails =
                                                          weekData[dayId];
                                                        const dayDate =
                                                          new Date(dayId);
                                                        const dayName =
                                                          dayDate.toLocaleDateString(
                                                            "en-US",
                                                            {
                                                              weekday: "short",
                                                              month: "short",
                                                              day: "numeric",
                                                            },
                                                          );

                                                        return (
                                                          <button
                                                            key={dayId}
                                                            onClick={() =>
                                                              setSelectedDateFilter(
                                                                {
                                                                  type: "day",
                                                                  value: dayId,
                                                                },
                                                              )
                                                            }
                                                            className={`w-full text-left px-3 py-1.5 rounded-md transition-colors text-xs ${
                                                              selectedDateFilter.type ===
                                                                "day" &&
                                                              selectedDateFilter.value ===
                                                                dayId
                                                                ? "bg-primary text-primary-foreground"
                                                                : "hover:bg-muted"
                                                            }`}
                                                          >
                                                            <div className="flex items-center justify-between">
                                                              <span>
                                                                {dayName}
                                                              </span>
                                                              <Badge
                                                                variant={
                                                                  selectedDateFilter.type ===
                                                                    "day" &&
                                                                  selectedDateFilter.value ===
                                                                    dayId
                                                                    ? "secondary"
                                                                    : "outline"
                                                                }
                                                                className="text-xs"
                                                              >
                                                                {
                                                                  dayEmails.length
                                                                }
                                                              </Badge>
                                                            </div>
                                                          </button>
                                                        );
                                                      })}
                                                    </div>
                                                  </AccordionContent>
                                                </AccordionItem>
                                              );
                                            })}
                                          </Accordion>
                                        </AccordionContent>
                                      </AccordionItem>
                                    );
                                  })}
                                </Accordion>
                              </div>
                            );
                          })}
                      </div>
                    </div>
                  </div>

                  {/* Email List */}
                  <div className="lg:col-span-3 space-y-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-muted-foreground">
                        {selectedDateFilter.type === "all"
                          ? `Showing all ${filteredEmailsByDate.length} emails`
                          : selectedDateFilter.type === "day"
                            ? `Showing ${filteredEmailsByDate.length} emails from ${new Date(selectedDateFilter.value!).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" })}`
                            : selectedDateFilter.type === "week"
                              ? `Showing ${filteredEmailsByDate.length} emails from ${selectedDateFilter.value}`
                              : `Showing ${filteredEmailsByDate.length} emails from ${new Date(selectedDateFilter.value! + "-01").toLocaleDateString("en-US", { month: "long", year: "numeric" })}`}
                      </p>
                      {selectedDateFilter.type !== "all" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedDateFilter({ type: "all" })}
                        >
                          <X className="h-4 w-4 mr-1" />
                          Clear Filter
                        </Button>
                      )}
                    </div>
                    {filteredEmailsByDate.map((email) => {
                      const headers = getEmailHeaders(email);
                      const subject = getHeader(headers, "Subject");
                      const from = getHeader(headers, "From");
                      const date = getHeader(headers, "Date");
                      const isIgnored = ignoredEmails.has(email.id);

                      return (
                        <div
                          key={email.id}
                          className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            isIgnored ? "opacity-50" : ""
                          }`}
                          onClick={() => toggleEmailExpansion(email.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {subject || "No Subject"}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {from}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(date)}
                              </Badge>
                              <Button
                                size="sm"
                                variant={isIgnored ? "default" : "ghost"}
                                className="h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEmailIgnored(email.id);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {expandedEmails.has(email.id) && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {email.snippet}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  {" "}
                  {dataSource === "upload"
                    ? "No emails found in uploaded file."
                    : "No emails found. Click &quot;Refresh Emails&quot; to try again."}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      {/* Emails by Sender Section */}
      {(isSignedIn || offlineMode) &&
        !(dataSource === "upload" && !showAllUploadSenders) &&
        emails.length > 0 && (
          <Card className="mt-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Emails by Sender ({emails.length})
              </CardTitle>
              <CardDescription className="flex items-center justify-between">
                <span>
                  Browse your {dataSource === "upload" ? "uploaded" : "Gmail"}{" "}
                  emails organized by sender
                </span>
                <div className="flex items-center gap-2">
                  <Switch
                    id="hide-ignored-sender"
                    checked={hideIgnoredBySender}
                    onCheckedChange={setHideIgnoredBySender}
                  />
                  <label
                    htmlFor="hide-ignored-sender"
                    className="text-sm font-medium cursor-pointer"
                  >
                    Hide ignored ({ignoredEmails.size})
                  </label>
                </div>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
                {/* Sender Navigation Panel */}
                <div className="lg:col-span-1 border-r pr-4">
                  <div className="space-y-2">
                    {/* All Emails Option */}
                    <button
                      onClick={() => setSelectedSenderFilter("all")}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        selectedSenderFilter === "all"
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">All Senders</span>
                        <Badge variant="secondary" className="text-xs">
                          {emails.length}
                        </Badge>
                      </div>
                    </button>

                    {/* Sender List - Organized by Domain */}
                    <div className="space-y-1 max-h-[600px] overflow-y-auto">
                      <Accordion
                        type="multiple"
                        value={expandedDomains}
                        onValueChange={setExpandedDomains}
                      >
                        {emailsBySender.map(
                          ({ domain, senders, totalCount }) => (
                            <AccordionItem key={domain} value={domain}>
                              <AccordionTrigger className="hover:no-underline py-2 px-3 hover:bg-muted rounded-md">
                                <div className="flex items-center justify-between w-full pr-2">
                                  <span className="text-sm font-medium">
                                    {domain}
                                  </span>
                                  <Badge variant="outline" className="text-xs">
                                    {totalCount}
                                  </Badge>
                                </div>
                              </AccordionTrigger>
                              <AccordionContent className="pl-4 space-y-1">
                                {senders.map(
                                  ({ username, fullEmail, count }) => (
                                    <button
                                      key={fullEmail}
                                      onClick={() =>
                                        setSelectedSenderFilter(fullEmail)
                                      }
                                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                                        selectedSenderFilter === fullEmail
                                          ? "bg-primary text-primary-foreground"
                                          : "hover:bg-muted"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between gap-2">
                                        <span className="text-sm truncate flex-1">
                                          {username}
                                        </span>
                                        <Badge
                                          variant={
                                            selectedSenderFilter === fullEmail
                                              ? "secondary"
                                              : "outline"
                                          }
                                          className="text-xs shrink-0"
                                        >
                                          {count}
                                        </Badge>
                                      </div>
                                    </button>
                                  ),
                                )}
                              </AccordionContent>
                            </AccordionItem>
                          ),
                        )}
                      </Accordion>
                    </div>
                  </div>
                </div>

                {/* Email List */}
                <div className="lg:col-span-3 space-y-4">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      {selectedSenderFilter === "all"
                        ? `Showing all ${filteredEmailsBySender.length} emails`
                        : `Showing ${filteredEmailsBySender.length} emails from ${selectedSenderFilter}`}
                    </p>
                    {selectedSenderFilter !== "all" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSelectedSenderFilter("all")}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Clear Filter
                      </Button>
                    )}
                  </div>
                  <div className="space-y-4 max-h-[600px] overflow-y-auto">
                    {filteredEmailsBySender.map((email) => {
                      const headers = getEmailHeaders(email);
                      const subject = getHeader(headers, "Subject");
                      const from = getHeader(headers, "From");
                      const date = getHeader(headers, "Date");
                      const isIgnored = ignoredEmails.has(email.id);

                      return (
                        <div
                          key={email.id}
                          className={`border rounded-lg p-4 hover:bg-muted/50 transition-colors cursor-pointer ${
                            isIgnored ? "opacity-50" : ""
                          }`}
                          onClick={() => toggleEmailExpansion(email.id)}
                        >
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-medium truncate">
                                {subject || "No Subject"}
                              </h3>
                              <p className="text-sm text-muted-foreground truncate">
                                {from}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                              <Badge variant="secondary" className="text-xs">
                                <Calendar className="w-3 h-3 mr-1" />
                                {formatDate(date)}
                              </Badge>
                              <Button
                                size="sm"
                                variant={isIgnored ? "default" : "ghost"}
                                className="h-6 px-2"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  toggleEmailIgnored(email.id);
                                }}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                          {expandedEmails.has(email.id) && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {email.snippet}
                            </p>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
    </div>
  );
};

export default EmailClient;
