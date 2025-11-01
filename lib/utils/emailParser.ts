/**
 * Email Parser Utilities
 *
 * Utilities for extracting and parsing email content from Gmail API responses.
 * Handles base64url decoding, email body extraction, and attachment detection.
 */

/**
 * Interface for email parts (matching the existing EmailPart interface)
 */
interface EmailPart {
  mimeType?: string;
  filename?: string;
  headers?: { name: string; value: string }[];
  body?: { data?: string; size?: number; attachmentId?: string };
  parts?: EmailPart[];
}

/**
 * Interface for email payload
 */
interface EmailPayload {
  headers?: { name: string; value: string }[];
  body?: { data?: string; size?: number };
  parts?: EmailPart[];
  mimeType?: string;
}

/**
 * Interface for attachment information
 */
export interface AttachmentInfo {
  filename: string;
  mimeType: string;
  size: number;
  attachmentId?: string;
}

/**
 * Interface for parsed email body
 */
export interface ParsedEmailBody {
  html: string | null;
  text: string | null;
  hasContent: boolean;
}

/**
 * Decode base64url encoded string
 * Gmail uses base64url encoding (RFC 4648) for email content
 *
 * @param data - Base64url encoded string
 * @returns Decoded string
 */
export function decodeBase64Url(data: string): string {
  if (!data) return "";

  try {
    // Replace base64url characters with base64 characters
    // - becomes +, _ becomes /, and add padding if needed
    let base64 = data.replace(/-/g, "+").replace(/_/g, "/");

    // Add padding if necessary
    const padding = base64.length % 4;
    if (padding) {
      base64 += "=".repeat(4 - padding);
    }

    // Decode base64 to UTF-8
    const decoded = atob(base64);

    // Convert to UTF-8 string
    return decodeURIComponent(
      Array.from(decoded)
        .map((char) => "%" + ("00" + char.charCodeAt(0).toString(16)).slice(-2))
        .join(""),
    );
  } catch (error) {
    console.error("Error decoding base64url:", error);
    return "";
  }
}

/**
 * Recursively parse email parts to extract body content and attachments
 *
 * @param parts - Array of email parts from payload
 * @returns Object containing body parts and attachments
 */
export function parseEmailParts(parts: EmailPart[]): {
  bodyParts: { type: string; content: string }[];
  attachments: AttachmentInfo[];
} {
  const bodyParts: { type: string; content: string }[] = [];
  const attachments: AttachmentInfo[] = [];

  if (!parts || parts.length === 0) {
    return { bodyParts, attachments };
  }

  for (const part of parts) {
    // Check if this part is an attachment
    if (isAttachment(part)) {
      attachments.push({
        filename: part.filename || "unnamed",
        mimeType: part.mimeType || "application/octet-stream",
        size: part.body?.size || 0,
        attachmentId: part.body?.attachmentId,
      });
      continue;
    }

    // If this part has nested parts, recursively parse them
    if (part.parts && part.parts.length > 0) {
      const nested = parseEmailParts(part.parts);
      bodyParts.push(...nested.bodyParts);
      attachments.push(...nested.attachments);
      continue;
    }

    // Extract body content if this is a body part
    if (part.body?.data) {
      const mimeType = part.mimeType || "";

      if (mimeType.includes("text/html")) {
        bodyParts.push({
          type: "html",
          content: decodeBase64Url(part.body.data),
        });
      } else if (mimeType.includes("text/plain")) {
        bodyParts.push({
          type: "text",
          content: decodeBase64Url(part.body.data),
        });
      }
    }
  }

  return { bodyParts, attachments };
}

/**
 * Extract email body from payload
 * Handles both simple emails (body in payload.body) and multipart emails (body in payload.parts)
 *
 * @param payload - Email payload from Gmail API
 * @returns Parsed email body with HTML and text content
 */
export function extractEmailBody(payload: EmailPayload): ParsedEmailBody {
  const result: ParsedEmailBody = {
    html: null,
    text: null,
    hasContent: false,
  };

  if (!payload) {
    return result;
  }

  // Case 1: Simple email with body directly in payload.body
  if (payload.body?.data) {
    const mimeType = payload.mimeType || "";
    const content = decodeBase64Url(payload.body.data);

    if (mimeType.includes("text/html")) {
      result.html = content;
      result.hasContent = true;
    } else if (mimeType.includes("text/plain")) {
      result.text = content;
      result.hasContent = true;
    } else {
      // Default to text if no specific type
      result.text = content;
      result.hasContent = true;
    }

    return result;
  }

  // Case 2: Multipart email with body in payload.parts
  if (payload.parts && payload.parts.length > 0) {
    const { bodyParts } = parseEmailParts(payload.parts);

    // Extract HTML and text content from body parts
    for (const part of bodyParts) {
      if (part.type === "html" && !result.html) {
        result.html = part.content;
        result.hasContent = true;
      } else if (part.type === "text" && !result.text) {
        result.text = part.content;
        result.hasContent = true;
      }
    }
  }

  return result;
}

/**
 * Detect if an email part is an attachment
 * An attachment is identified by:
 * 1. Having a filename property with non-empty value
 * 2. OR having a Content-Disposition header set to "attachment"
 *
 * @param part - Email part to check
 * @returns True if part is an attachment
 */
export function isAttachment(part: EmailPart): boolean {
  // Check if part has a filename
  if (part.filename && part.filename.trim() !== "") {
    return true;
  }

  // Check Content-Disposition header
  if (part.headers) {
    const disposition = part.headers.find(
      (h) => h.name.toLowerCase() === "content-disposition",
    );

    if (disposition && disposition.value.toLowerCase().includes("attachment")) {
      return true;
    }
  }

  // Some inline images might have attachmentId but no filename
  // We don't treat these as downloadable attachments
  return false;
}

/**
 * Extract all attachments from email payload
 *
 * @param payload - Email payload from Gmail API
 * @returns Array of attachment information
 */
export function extractAttachments(payload: EmailPayload): AttachmentInfo[] {
  if (!payload || !payload.parts || payload.parts.length === 0) {
    return [];
  }

  const { attachments } = parseEmailParts(payload.parts);
  return attachments;
}

/**
 * Format file size in human-readable format
 *
 * @param bytes - File size in bytes
 * @returns Formatted string (e.g., "1.5 MB", "230 KB")
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";

  const units = ["B", "KB", "MB", "GB"];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${(bytes / Math.pow(k, i)).toFixed(1)} ${units[i]}`;
}

/**
 * Get file type icon/emoji based on MIME type
 *
 * @param mimeType - MIME type of the file
 * @returns Icon/emoji representing the file type
 */
export function getFileTypeIcon(mimeType: string): string {
  if (!mimeType) return "📄";

  const type = mimeType.toLowerCase();

  // Images
  if (type.startsWith("image/")) return "🖼️";

  // PDFs
  if (type.includes("pdf")) return "📕";

  // Documents
  if (type.includes("word") || type.includes("document")) return "📝";
  if (type.includes("excel") || type.includes("spreadsheet")) return "📊";
  if (type.includes("powerpoint") || type.includes("presentation")) return "📊";

  // Archives
  if (type.includes("zip") || type.includes("rar") || type.includes("7z"))
    return "📦";

  // Text files
  if (type.startsWith("text/")) return "📄";

  // Videos
  if (type.startsWith("video/")) return "🎥";

  // Audio
  if (type.startsWith("audio/")) return "🎵";

  // Default
  return "📎";
}

/**
 * Sanitize HTML content to prevent XSS attacks using DOMPurify
 * Configured for safe email content rendering with proper security controls
 *
 * Note: This function uses basic regex sanitization on the server and
 * DOMPurify on the client to avoid Next.js server-side issues
 *
 * @param html - Raw HTML content from email
 * @returns Sanitized HTML safe for rendering
 */
export function sanitizeHtmlContent(html: string): string {
  if (!html) return "";

  // Check if we're in a browser environment
  const isBrowser = typeof window !== "undefined";

  if (isBrowser) {
    // Client-side: Use DOMPurify for comprehensive protection
    try {
      // Dynamically import DOMPurify only on client side
      // eslint-disable-next-line @typescript-eslint/no-require-imports
      const DOMPurify = require("isomorphic-dompurify");

      const config = {
        // Allow common email formatting tags
        ALLOWED_TAGS: [
          "p",
          "br",
          "div",
          "span",
          "h1",
          "h2",
          "h3",
          "h4",
          "h5",
          "h6",
          "strong",
          "em",
          "b",
          "i",
          "u",
          "s",
          "strike",
          "del",
          "ul",
          "ol",
          "li",
          "blockquote",
          "pre",
          "code",
          "a",
          "img",
          "table",
          "thead",
          "tbody",
          "tr",
          "th",
          "td",
          "hr",
          "sup",
          "sub",
          "font",
          "center",
          "small",
          "big",
        ],
        ALLOWED_ATTR: [
          "href",
          "src",
          "alt",
          "title",
          "width",
          "height",
          "style",
          "class",
          "id",
          "target",
          "align",
          "color",
          "size",
          "face",
          "border",
          "cellpadding",
          "cellspacing",
          "colspan",
          "rowspan",
          "valign",
          "bgcolor",
        ],
        ALLOW_DATA_ATTR: true,
        ADD_ATTR: ["target", "rel"],
        ALLOWED_URI_REGEXP:
          /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|cid|xmpp|data):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
        RETURN_DOM: false,
        RETURN_DOM_FRAGMENT: false,
        RETURN_TRUSTED_TYPE: false,
      };

      let sanitized = DOMPurify.sanitize(html, config);

      // Ensure all external links open in new tab with security attributes
      sanitized = sanitized.replace(
        /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
        '<a $1 target="_blank" rel="noopener noreferrer">',
      );

      return sanitized;
    } catch (error) {
      console.error("Error loading DOMPurify:", error);
      // Fall through to basic sanitization
    }
  }

  // Server-side or fallback: Basic regex sanitization
  const sanitized = html
    // Remove script tags
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    // Remove event handlers
    .replace(/on\w+\s*=\s*["'][^"']*["']/gi, "")
    .replace(/on\w+\s*=\s*[^\s>]*/gi, "")
    // Remove javascript: protocol
    .replace(/href\s*=\s*["']javascript:[^"']*["']/gi, "")
    .replace(/src\s*=\s*["']javascript:[^"']*["']/gi, "")
    // Add security attributes to links
    .replace(
      /<a\s+([^>]*href=["'][^"']*["'][^>]*)>/gi,
      '<a $1 target="_blank" rel="noopener noreferrer">',
    );

  return sanitized;
}

/**
 * Count total attachments in an email payload
 *
 * @param payload - Email payload from Gmail API
 * @returns Number of attachments
 */
export function countAttachments(payload: EmailPayload): number {
  return extractAttachments(payload).length;
}

/**
 * Check if email has attachments
 *
 * @param payload - Email payload from Gmail API
 * @returns True if email has attachments
 */
export function hasAttachments(payload: EmailPayload): boolean {
  return countAttachments(payload) > 0;
}
