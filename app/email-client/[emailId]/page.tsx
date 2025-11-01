"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useRef } from "react";
import { ArrowLeft, Calendar, Mail, Paperclip, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  extractEmailBody,
  extractAttachments,
  formatFileSize,
  getFileTypeIcon,
  sanitizeHtmlContent,
  type AttachmentInfo,
  type ParsedEmailBody,
} from "@/lib/utils/emailParser";

interface EmailPart {
  body?: { data?: string };
  parts?: EmailPart[];
  filename?: string;
  mimeType?: string;
}

interface EmailData {
  id: string;
  snippet: string;
  payload?: {
    headers: { name: string; value: string }[];
    body?: { data?: string };
    parts?: EmailPart[];
  };
  headers?: { name: string; value: string }[];
  date?: string;
  from?: string;
  subject?: string;
  to?: string;
}

export default function EmailDetailPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailId = params.emailId as string;
  const isOfflineMode = searchParams.get("offline") === "true";

  const [email, setEmail] = useState<EmailData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailBody, setEmailBody] = useState<ParsedEmailBody | null>(null);
  const [attachments, setAttachments] = useState<AttachmentInfo[]>([]);
  const hasLoadedRef = useRef(false);

  useEffect(() => {
    // Prevent double-loading in React 18 Strict Mode
    if (hasLoadedRef.current) return;
    hasLoadedRef.current = true;

    const loadEmail = () => {
      try {
        console.log("[EmailDetail] Starting email load for ID:", emailId);

        // First, check for full email data cache (has complete body/parts)
        const fullEmailsCache = localStorage.getItem("gmail-full-emails");
        if (fullEmailsCache) {
          try {
            const fullEmails = JSON.parse(fullEmailsCache);
            if (fullEmails[emailId]) {
              console.log("[EmailDetail] Found email in full-emails cache");
              const foundEmail = fullEmails[emailId];

              // Debug: Log email structure
              const emailV2 = foundEmail as EmailData & {
                fullDataPath?: string;
                ignored?: boolean;
              };

              console.log(
                "[EmailDetail] Email has payload:",
                !!foundEmail.payload,
              );
              console.log(
                "[EmailDetail] Email has fullDataPath:",
                !!emailV2.fullDataPath,
              );
              console.log("[EmailDetail] Email is ignored:", !!emailV2.ignored);

              // Check if email is ignored - if so, don't try to fetch full data
              const isIgnored = emailV2.ignored === true;

              if (isIgnored) {
                console.log(
                  "[EmailDetail] Email is marked as ignored, showing snippet only",
                );
                setEmail(foundEmail);
                setLoading(false);
                return;
              }

              // Check if this email has fullDataPath but no valid payload data (needs API fetch)
              const fullDataPath = emailV2.fullDataPath;

              // Improved validation: check if payload actually contains data, not just empty structures
              const hasValidPayload =
                foundEmail.payload &&
                // Check if body.data exists and has content
                ((foundEmail.payload.body?.data &&
                  foundEmail.payload.body.data.length > 0) ||
                  // Check if parts array exists and has items with data
                  (Array.isArray(foundEmail.payload.parts) &&
                    foundEmail.payload.parts.length > 0 &&
                    foundEmail.payload.parts.some(
                      (part: { body?: { data?: string }; parts?: unknown }) =>
                        part.body?.data || part.parts,
                    )));

              console.log(
                "[EmailDetail] Has valid payload data:",
                hasValidPayload,
              );

              if (fullDataPath && !hasValidPayload) {
                console.log(
                  "[EmailDetail] Email has fullDataPath but no valid payload, fetching from API:",
                  fullDataPath,
                );

                // Extract date from email for API call
                const emailDate = foundEmail.date
                  ? new Date(foundEmail.date).toISOString().split("T")[0]
                  : null;

                console.log(
                  "[EmailDetail] Extracted date for API call:",
                  emailDate,
                );

                if (emailDate) {
                  const apiUrl = `/api/smart-fetch/full-data?emailId=${emailId}&date=${emailDate}`;
                  console.log("[EmailDetail] Fetching from API:", apiUrl);

                  // Fetch full data from API
                  fetch(apiUrl)
                    .then(async (res) => {
                      console.log(
                        "[EmailDetail] API response status:",
                        res.status,
                        res.statusText,
                      );
                      if (!res.ok) {
                        throw new Error(`API error: ${res.statusText}`);
                      }
                      return res.json();
                    })
                    .then((data) => {
                      console.log("[EmailDetail] API response data:", data);
                      if (data.success && data.email) {
                        console.log(
                          "[EmailDetail] Successfully loaded full email data from API",
                        );
                        const fullEmail = data.email;
                        setEmail(fullEmail);

                        if (fullEmail.payload) {
                          const body = extractEmailBody(fullEmail.payload);
                          console.log(
                            "[EmailDetail] Body extracted - hasHtml:",
                            !!body.html,
                            "hasText:",
                            !!body.text,
                          );
                          setEmailBody(body);

                          const atts = extractAttachments(fullEmail.payload);
                          console.log(
                            "[EmailDetail] Attachments found:",
                            atts.length,
                          );
                          setAttachments(atts);
                        }

                        setLoading(false);
                      } else {
                        throw new Error("Invalid API response");
                      }
                    })
                    .catch((err) => {
                      console.error(
                        "[EmailDetail] Error fetching full data from API:",
                        err,
                      );
                      // Fall back to showing the snippet version
                      setEmail(foundEmail);
                      setLoading(false);
                    });
                  return; // Exit early, API call will handle setting state
                } else {
                  console.warn(
                    "[EmailDetail] No date found for email, cannot fetch full data",
                  );
                }
              } else {
                console.log(
                  "[EmailDetail] Email already has valid payload or no fullDataPath",
                );
              }

              // If we have payload, use it directly
              setEmail(foundEmail);

              if (hasValidPayload) {
                console.log(
                  "[EmailDetail] Extracting email body and attachments from full data",
                );
                const body = extractEmailBody(foundEmail.payload);
                console.log(
                  "[EmailDetail] Body extracted - hasHtml:",
                  !!body.html,
                  "hasText:",
                  !!body.text,
                );
                setEmailBody(body);

                const atts = extractAttachments(foundEmail.payload);
                console.log("[EmailDetail] Attachments found:", atts.length);
                setAttachments(atts);
              }

              setLoading(false);
              return;
            }
          } catch (err) {
            console.error(
              "[EmailDetail] Error reading full-emails cache:",
              err,
            );
          }
        }

        // Fallback: Try to get from localStorage - check all possible keys
        const gmailCache = localStorage.getItem("gmail-client-cache");
        const cachedEmails = localStorage.getItem("cachedEmails");
        const uploadedEmails = localStorage.getItem("uploadedEmails");

        console.log("[EmailDetail] gmail-client-cache exists:", !!gmailCache);
        console.log("[EmailDetail] cachedEmails exists:", !!cachedEmails);
        console.log("[EmailDetail] uploadedEmails exists:", !!uploadedEmails);

        const storedEmails = gmailCache || cachedEmails || uploadedEmails;

        if (storedEmails) {
          const storageSource = gmailCache
            ? "gmail-client-cache"
            : cachedEmails
              ? "cachedEmails"
              : "uploadedEmails";
          console.log("[EmailDetail] Using storage key:", storageSource);

          const parsed = JSON.parse(storedEmails);
          // Handle both formats: gmail-client-cache has {emails: [...]} structure, others are direct arrays
          const emails: EmailData[] = Array.isArray(parsed)
            ? parsed
            : parsed.emails || [];

          console.log("[EmailDetail] Total emails in storage:", emails.length);
          console.log(
            "[EmailDetail] First 5 email IDs:",
            emails.slice(0, 5).map((e) => e.id),
          );

          const foundEmail = emails.find((e) => e.id === emailId);
          console.log("[EmailDetail] Email found:", !!foundEmail);

          if (foundEmail) {
            const emailV2Fallback = foundEmail as EmailData & {
              fullDataPath?: string;
              ignored?: boolean;
            };

            console.log(
              "[EmailDetail] Found email subject:",
              foundEmail.payload?.headers?.find((h) => h.name === "Subject")
                ?.value || foundEmail.subject,
            );

            // Check if email is ignored - if so, don't try to fetch full data
            const isIgnored = emailV2Fallback.ignored === true;

            if (isIgnored) {
              console.log(
                "[EmailDetail] Email is marked as ignored, showing snippet only",
              );
              setEmail(foundEmail);
              setLoading(false);
              return;
            }

            // Check if email has fullDataPath (v2.0 format) but no payload
            const fullDataPath = emailV2Fallback.fullDataPath;

            if (fullDataPath && !foundEmail.payload) {
              console.log(
                "[EmailDetail] Email has fullDataPath, fetching from API:",
                fullDataPath,
              );

              // Extract date from email for API call
              const emailDate = foundEmail.date
                ? new Date(foundEmail.date).toISOString().split("T")[0]
                : null;

              if (emailDate) {
                // Fetch full data from API
                fetch(
                  `/api/smart-fetch/full-data?emailId=${emailId}&date=${emailDate}`,
                )
                  .then(async (res) => {
                    if (!res.ok) {
                      throw new Error(`API error: ${res.statusText}`);
                    }
                    return res.json();
                  })
                  .then((data) => {
                    if (data.success && data.email) {
                      console.log(
                        "[EmailDetail] Loaded full email data from API",
                      );
                      const fullEmail = data.email;
                      setEmail(fullEmail);

                      if (fullEmail.payload) {
                        const body = extractEmailBody(fullEmail.payload);
                        console.log(
                          "[EmailDetail] Body extracted - hasHtml:",
                          !!body.html,
                          "hasText:",
                          !!body.text,
                        );
                        setEmailBody(body);

                        const atts = extractAttachments(fullEmail.payload);
                        console.log(
                          "[EmailDetail] Attachments found:",
                          atts.length,
                        );
                        setAttachments(atts);
                      }

                      setLoading(false);
                    } else {
                      throw new Error("Failed to load full email data");
                    }
                  })
                  .catch((err) => {
                    console.error(
                      "[EmailDetail] Error fetching full data:",
                      err,
                    );
                    // Fall back to showing snippet only
                    setEmail(foundEmail);
                    setError(
                      "Full email content not available. Showing snippet only.",
                    );
                    setLoading(false);
                  });
                return; // Exit early, waiting for API response
              }
            }

            // Set email immediately if payload exists or no fullDataPath
            setEmail(foundEmail);

            // Extract body and attachments if payload exists
            if (foundEmail.payload) {
              console.log(
                "[EmailDetail] Extracting email body and attachments",
              );
              const body = extractEmailBody(foundEmail.payload);
              console.log(
                "[EmailDetail] Body extracted - hasHtml:",
                !!body.html,
                "hasText:",
                !!body.text,
              );
              setEmailBody(body);

              const atts = extractAttachments(foundEmail.payload);
              console.log("[EmailDetail] Attachments found:", atts.length);
              setAttachments(atts);
            } else {
              console.log(
                "[EmailDetail] No payload found in email - showing snippet only",
              );
            }

            setLoading(false);
            return;
          } else {
            console.warn(
              "[EmailDetail] Email ID not found in storage. Looking for:",
              emailId,
            );
            console.warn(
              "[EmailDetail] Available IDs:",
              emails.map((e) => e.id),
            );
          }
        } else {
          console.warn("[EmailDetail] No emails found in localStorage");
        }

        // If not found, show error
        console.error("[EmailDetail] Email not found, showing error message");
        setError(
          "Email not found. It may have been cleared from offline storage.",
        );
        setLoading(false);
      } catch (err) {
        console.error("[EmailDetail] Error loading email:", err);
        setError("Failed to load email");
        setLoading(false);
      }
    };

    loadEmail();
  }, [emailId]);

  // Helper function to get header value
  const getHeader = (name: string): string => {
    if (!email) return "";

    // Check payload.headers first
    if (email.payload?.headers) {
      const header = email.payload.headers.find(
        (h) => h.name.toLowerCase() === name.toLowerCase(),
      );
      if (header) return header.value;
    }

    // Fallback to root level properties
    const nameLower = name.toLowerCase();
    if (nameLower === "from" && email.from) return email.from;
    if (nameLower === "to" && email.to) return email.to;
    if (nameLower === "subject" && email.subject) return email.subject;
    if (nameLower === "date" && email.date) return email.date;

    return "";
  };

  const formatDate = (dateString: string): string => {
    if (!dateString) return "Unknown date";
    try {
      const date = new Date(dateString);
      return date.toLocaleString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="flex items-center justify-center min-h-[400px]">
          <p className="text-muted-foreground">Loading email...</p>
        </div>
      </div>
    );
  }

  if (error || !email) {
    return (
      <div className="container mx-auto py-8 px-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p>{error || "Email not found"}</p>
            <Button
              onClick={() =>
                router.push(
                  isOfflineMode
                    ? "/email-client?offline=true"
                    : "/email-client",
                )
              }
              variant="outline"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Email Client
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const subject = getHeader("Subject");
  const from = getHeader("From");
  const to = getHeader("To");
  const date = getHeader("Date");

  return (
    <div className="container mx-auto py-8 px-4 max-w-5xl">
      {/* Back Navigation */}
      <div className="mb-6">
        <Button
          onClick={() =>
            router.push(
              isOfflineMode ? "/email-client?offline=true" : "/email-client",
            )
          }
          variant="outline"
          size="sm"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Email Client
        </Button>
      </div>

      {/* Email Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl break-words">
            {subject || "No Subject"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* From */}
          <div className="flex items-start gap-3">
            <User className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">From</p>
              <p className="text-sm break-words">{from || "Unknown"}</p>
            </div>
          </div>

          {/* To */}
          {to && (
            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-muted-foreground">To</p>
                <p className="text-sm break-words">{to}</p>
              </div>
            </div>
          )}

          {/* Date */}
          <div className="flex items-start gap-3">
            <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-muted-foreground">Date</p>
              <p className="text-sm">{formatDate(date)}</p>
            </div>
          </div>

          {/* Attachments Badge */}
          {attachments.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Paperclip className="w-5 h-5 text-muted-foreground" />
              <Badge variant="secondary">
                {attachments.length} attachment
                {attachments.length !== 1 ? "s" : ""}
              </Badge>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Email Body Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Message</CardTitle>
        </CardHeader>
        <CardContent>
          {emailBody?.html ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: sanitizeHtmlContent(emailBody.html),
              }}
            />
          ) : emailBody?.text ? (
            <pre className="whitespace-pre-wrap font-sans text-sm">
              {emailBody.text}
            </pre>
          ) : (
            <p className="text-muted-foreground italic">
              {email.snippet || "No content available"}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Attachments Card */}
      {attachments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Paperclip className="w-5 h-5" />
              Attachments ({attachments.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <span className="text-2xl">
                      {getFileTypeIcon(attachment.mimeType)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {attachment.filename}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(attachment.size)}</span>
                        <span>•</span>
                        <span className="truncate">{attachment.mimeType}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="ml-2">
                    {attachment.attachmentId ? "Has ID" : "Inline"}
                  </Badge>
                </div>
              ))}
            </div>
            <Separator className="my-4" />
            <p className="text-xs text-muted-foreground">
              Note: Gmail API requires separate requests to download attachment
              content. Full download functionality is not yet implemented.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
