"use client";

// #region Imports
import React, { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { loadPendingPdf, deletePendingPdf } from "@/lib/pendingPdfStore";
import {
  analyzeUploadConflicts,
  ConflictAnalysis,
  Transaction,
} from "@/app/actions/conflictAnalysis";
import {
  uploadToSupabase,
  executeTableCreation,
} from "@/app/actions/fileActions";
import {
  analyzeCategoryMatches,
  CategoryAnalysis,
  CategoryAnalysisProgress,
} from "@/app/actions/categoryAnalysis";
import { MergeConflictDialog } from "@/components/MergeConflictDialog";
import { CategoryAssignmentDialog } from "@/components/CategoryAssignmentDialog";

// #endregion
// >>> TOC 1: Imports <<<
// ------------------------------------------------------------------
// Section: Imports
// - External libs and application actions/components imported above.
// - Keep imports grouped by purpose: libs, actions, components.
// ------------------------------------------------------------------

/**
 * Table of Contents (this file):
 * 1. Imports
 * 2. Types & Declarations
 * 3. Component (Page)
 * 4. Component State
 * 5. Helpers (pdf.js loader & utilities)
 * 6. Handlers (file selection & extraction entry points)
 * 7. Extraction (page-level text extraction)
 * 8. Parsing (snippet -> records)
 * 9. Adapters & Filename parsing
 * 10. Upload/confirm handlers
 * 11. Render / UI
 */

// #region Types & Declarations
// Minimal types for the portions of pdf.js we use here
type PDFTextItem = { str?: string };
interface PDFPageProxy {
  getTextContent(): Promise<{ items: PDFTextItem[] }>;
}
interface PDFDocumentProxy {
  numPages: number;
  getPage(pageNumber: number): Promise<PDFPageProxy>;
}

declare global {
  interface Window {
    pdfjsLib?: {
      GlobalWorkerOptions?: { workerSrc?: string };
      getDocument: (opts: { data: ArrayBuffer; password?: string }) => {
        promise: Promise<PDFDocumentProxy>;
      };
    };
  }
}
// #endregion
// >>> TOC 2: Types & Declarations <<<
// ------------------------------------------------------------------
// Section: Types & Declarations
// - Minimal PDF-related types and global augmentation for `pdfjsLib`.
// - These are lightweight shims used only for typing within this file.
// ------------------------------------------------------------------

// >>> TOC 3: Component (Page) <<<
// ------------------------------------------------------------------
// Component: `Page` (Rico PDF parser UI)
// - Stateful client component that loads pdf.js, extracts text from
//   uploaded PDFs, allows snippet editing, converts snippets to
//   structured JSON, and integrates with the upload/confirm flow.
// ------------------------------------------------------------------
// #region Component (Page)
export default function Page() {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pdfLoaded, setPdfLoaded] = useState(false);
  const [progress, setProgress] = useState("Ready");
  const [latestArrayBuffer, setLatestArrayBuffer] =
    useState<ArrayBuffer | null>(null);
  const [extractedText, setExtractedText] = useState("");
  const [pageTexts, setPageTexts] = useState<string[]>([]);
  const [page3Snippet2091, setPage3Snippet2091] = useState("");
  const [page3Snippet7102, setPage3Snippet7102] = useState("");
  const [jsonOut, setJsonOut] = useState("");
  const [editableSnippet2091, setEditableSnippet2091] = useState("");
  const [editableSnippet7102, setEditableSnippet7102] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [pwMessage, setPwMessage] = useState("");
  const pwInputRef = useRef<HTMLInputElement | null>(null);
  const [reviewMode, setReviewMode] = useState(false);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [pendingFilename, setPendingFilename] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  // >>> TOC 4: Component State <<<
  // #region Component State
  // ----------------------------------------------------------------
  // Component State: refs, UI state and flow control
  // - `fileRef`, `latestArrayBuffer`, `pageTexts`, and multiple snippet
  //   states track the PDF and extracted content.
  // - `conflictAnalysis`, `categoryAnalysis` and related flags manage
  //   the upload/merge/category UI flows after confirmation.
  // ----------------------------------------------------------------
  // Upload/conflict state for confirm flow
  const [conflictAnalysis, setConflictAnalysis] =
    useState<ConflictAnalysis | null>(null);
  const [showMergeDialog, setShowMergeDialog] = useState(false);
  const [, setUploadingFlow] = useState(false);
  const [categoryAnalysis, setCategoryAnalysis] =
    useState<CategoryAnalysis | null>(null);
  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  type CategoryProgress = {
    show: boolean;
    stage: string;
    message: string;
    current: number;
    total: number;
  };
  const [, setCategoryProgress] = useState<CategoryProgress>({
    show: false,
    stage: "",
    message: "",
    current: 0,
    total: 0,
  });
  const [uploadSummary, setUploadSummary] = useState<{
    show: boolean;
    success: boolean;
    message: string;
    details?: string;
  }>({ show: false, success: false, message: "", details: "" });

  // tolerant 'Subtotal' regex
  const SUBTOTAL_REGEX = /S\s*u\s*b\s*t\s*o\s*t\s*a\s*l/i;

  // #endregion
  // >>> TOC 5: Helpers (pdf.js loader & utilities) <<<
  // #region Helpers (pdf.js loader & utilities)
  // ----------------------------------------------------------------
  // Helpers: PDF.js loader and utilities
  // - `loadPdfJsFromCdn`, `ensurePdfJsLoaded` handle loading and
  //   verifying availability of the pdf.js runtime used for extraction.
  // ----------------------------------------------------------------

  useEffect(() => {
    if (pdfLoaded && window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js";
    }
  }, [pdfLoaded]);

  // Load pdf.js by injecting a script tag (more reliable than Next's Script in some dev setups)
  function loadPdfJsFromCdn(): Promise<void> {
    if (window.pdfjsLib) {
      setPdfLoaded(true);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      // Avoid adding multiple script tags
      if (document.querySelector("script[data-pdfjs]")) {
        // Poll for availability
        const t0 = Date.now();
        const id = setInterval(() => {
          if (window.pdfjsLib) {
            clearInterval(id);
            setPdfLoaded(true);
            resolve();
          } else if (Date.now() - t0 > 10000) {
            clearInterval(id);
            reject(new Error("pdfjs did not initialize"));
          }
        }, 100);
        return;
      }
      const s = document.createElement("script");
      s.setAttribute("data-pdfjs", "1");
      s.src = "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.min.js";
      s.async = true;
      s.crossOrigin = "anonymous";
      s.onload = () => {
        setPdfLoaded(true);
        resolve();
      };
      s.onerror = () => reject(new Error("Failed to load pdf.js script"));
      document.head.appendChild(s);
    });
  }

  // Start loading pdf.js on mount
  useEffect(() => {
    loadPdfJsFromCdn().catch((err) => {
      console.error("pdf.js load failed", err);
      setProgress("Failed loading pdf.js");
    });
  }, []);

  // Auto-load pending PDF when redirected from upload page
  useEffect(() => {
    const fromUpload = searchParams.get("fromUpload");
    const key = searchParams.get("key");
    if (fromUpload === "1" && key) {
      (async () => {
        setProgress("Loading pending PDF...");
        try {
          const rec = await loadPendingPdf(key);
          if (!rec) {
            setProgress("Pending PDF not found");
            return;
          }
          setPendingKey(key);
          setPendingFilename(rec.filename || null);
          setLatestArrayBuffer(rec.arrayBuffer);
          // Run extraction and get cards
          const cards = await tryOpenAndExtract(rec.arrayBuffer as ArrayBuffer);
          // Prefill editable editors with extracted snippets (if present)
          const key2091 = "CARLOS A S VELOSO - 4998********2091";
          const key7102 = "CARLOS A S VELOSO - 4998********7102";
          const s1 = (cards && cards[key2091]) || page3Snippet2091 || "";
          const s2 = (cards && cards[key7102]) || page3Snippet7102 || "";
          setEditableSnippet2091(s1);
          setEditableSnippet7102(s2);
          setReviewMode(true);
          setProgress("Pending PDF loaded — review parsed snippets");
        } catch (e) {
          console.error("Failed loading pending PDF", e);
          setProgress("Failed to load pending PDF");
        }
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Wait for the pdf.js script to be available (with timeout)
  async function ensurePdfJsLoaded(timeout = 8000) {
    if (window.pdfjsLib) return;
    try {
      await loadPdfJsFromCdn();
    } catch {
      // fallback to polling if injection didn't initialize the global
    }
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      const id = setInterval(() => {
        if (window.pdfjsLib) {
          clearInterval(id);
          resolve();
          return;
        }
        if (Date.now() - start > timeout) {
          clearInterval(id);
          reject(new Error("pdfjsLib failed to load within timeout"));
        }
      }, 100);
    });
  }

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files && e.target.files[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => {
      setLatestArrayBuffer(reader.result as ArrayBuffer);
      setProgress(`Loaded file ${f.name} (${Math.round(f.size / 1024)} KB)`);
    };
    reader.onerror = () => setProgress("Error reading file");
    reader.readAsArrayBuffer(f);
  }

  async function onExtractClick() {
    if (!latestArrayBuffer) {
      alert("No PDF selected.");
      return;
    }
    setExtractedText("");
    setPageTexts([]);
    setPage3Snippet2091("");
    setPage3Snippet7102("");
    setJsonOut("");
    setProgress("Starting extraction...");
    try {
      await tryOpenAndExtract(latestArrayBuffer);
    } catch (err: unknown) {
      console.error(err);
      setProgress("Extraction failed");
      setExtractedText(
        "Error: " + (err instanceof Error ? err.message : String(err)),
      );
    }
  }

  async function tryOpenAndExtract(
    arrayBuffer: ArrayBuffer,
    providedPassword?: string,
  ) {
    setProgress("Opening PDF...");
    try {
      await ensurePdfJsLoaded(8000);
    } catch {
      throw new Error(
        "pdfjsLib not available — make sure the pdf.js script is loaded",
      );
    }
    const uint8 = new Uint8Array(arrayBuffer);
    const dataCopy = uint8.slice().buffer;
    if (!window.pdfjsLib) throw new Error("pdfjsLib not available");
    if (window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js";
    }
    const loadingTask = window.pdfjsLib.getDocument({
      data: dataCopy,
      password: providedPassword,
    });
    try {
      const pdf = await loadingTask.promise;
      setProgress(`PDF opened — ${pdf.numPages} page(s). Extracting text...`);
      const cards = await extractAllText(pdf);
      setProgress("Extraction complete");
      return cards;
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      const needsPassword =
        /password/i.test(msg) ||
        (err instanceof Error && err.name === "PasswordException");
      if (needsPassword) {
        if (providedPassword) {
          setPwMessage("Incorrect password — please try again");
          setShowPassword(true);
          return;
        }
        setPwMessage("");
        setShowPassword(true);
        return;
      }
      throw err;
    }
  }

  // #endregion
  // ----------------------------------------------------------------
  // Extraction: page-level text extraction
  // - `extractAllText` iterates through pages, collects raw text, and
  //   delegates to `extractCardsFromPages` to locate card snippets.
  // ----------------------------------------------------------------

  async function extractAllText(pdf: PDFDocumentProxy) {
    let accum = "";
    const num = pdf.numPages;
    const pages: string[] = [];
    for (let i = 1; i <= num; i++) {
      setProgress(`Extracting page ${i} / ${num}...`);
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map(
          (item: PDFTextItem) => item.str || "",
        );
        const pageText = strings.join(" ");
        pages[i - 1] = pageText;
        // keep filling pages; we'll compute cross-page snippets after loop
        accum += `\n\n--- Page ${i} ---\n\n` + pageText;
      } catch (err) {
        console.error("Error extracting page", i, err);
        accum += `\n\n--- Page ${i} [error extracting] ---\n\n`;
      }
    }
    setExtractedText(accum);
    setPageTexts(pages);

    // After we've collected all pages, extract snippets that may be split across pages
    try {
      const cards = extractCardsFromPages(pages, 2);
      const key2091 = "CARLOS A S VELOSO - 4998********2091";
      const key7102 = "CARLOS A S VELOSO - 4998********7102";
      const s1 = cards[key2091] || "";
      const s2 = cards[key7102] || "";
      setPage3Snippet2091(s1);
      setPage3Snippet7102(s2);
      buildStructuredJSON(s1, s2);
      return cards;
    } catch (e) {
      console.error("post-page extraction failed", e);
      return {} as Record<string, string>;
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function extractSnippet2091FromText(text: string) {
    if (!text) return "";
    const normalized = text.replace(/\r/gi, "");
    const specificRegex = /CARLOS\s+A\s+S\s+VELOSO\s*-\s*4998\*+2091/i;
    const match = specificRegex.exec(normalized);
    if (!match) return "";
    const startIndex = match.index;
    const afterMatch = normalized.substring(startIndex + match[0].length);
    const subtotalMatch = SUBTOTAL_REGEX.exec(afterMatch);
    const endIndex = subtotalMatch
      ? startIndex + match[0].length + subtotalMatch.index
      : normalized.length;
    const snippet = normalized.substring(startIndex, endIndex).trim();
    setPage3Snippet2091(snippet);
    return snippet;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function extractSnippet7102FromText(text: string) {
    if (!text) return "";
    const normalized = text.replace(/\r/gi, "");
    const specificRegex = /CARLOS\s+A\s+S\s+VELOSO\s*-\s*4998\*+7102/i;
    const match = specificRegex.exec(normalized);
    if (!match) return "";
    const startIndex = match.index;
    const afterMatch = normalized.substring(startIndex + match[0].length);
    const subtotalMatch = SUBTOTAL_REGEX.exec(afterMatch);
    const endIndex = subtotalMatch
      ? startIndex + match[0].length + subtotalMatch.index
      : normalized.length;
    const snippet = normalized.substring(startIndex, endIndex).trim();
    setPage3Snippet7102(snippet);
    return snippet;
  }

  // Search for a card match starting at a given page index and continue across
  // subsequent pages until SUBTOTAL is found (useful when tables split across pages)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  function extractSnippetAcrossPages(
    pages: string[],
    startPageIndex: number,
    cardRegex: RegExp,
  ) {
    if (!pages || pages.length <= startPageIndex) return "";
    const concat = pages.slice(startPageIndex).join("\n");
    const match = cardRegex.exec(concat);
    if (!match) return "";
    const startIndex = match.index;
    const after = concat.substring(startIndex + match[0].length);
    const subtotalMatch = SUBTOTAL_REGEX.exec(after);
    const endIndex = subtotalMatch
      ? startIndex + match[0].length + subtotalMatch.index
      : concat.length;
    const snippet = concat.substring(startIndex, endIndex).trim();
    return snippet;
  }

  // #region Extraction (page-level text extraction)

  // Extract all card snippets from pages starting at startPageIndex.
  // This is more robust: it finds card headers, looks for column headers and
  // chooses the last SUBTOTAL between a card header and the next card header
  // (so continuation rows on following pages are included).
  function extractCardsFromPages(pages: string[], startPageIndex: number) {
    const concat = pages.slice(startPageIndex).join("\n");
    const result: Record<string, string> = {};
    const cardPatterns = [
      {
        key: "CARLOS A S VELOSO - 4998********2091",
        re: /CARLOS\s+A\s+S\s+VELOSO\s*-\s*4998\*+2091/gi,
      },
      {
        key: "CARLOS A S VELOSO - 4998********7102",
        re: /CARLOS\s+A\s+S\s+VELOSO\s*-\s*4998\*+7102/gi,
      },
    ];

    // Find all card header occurrences with positions
    const cardMatches: { key: string; idx: number }[] = [];
    for (const p of cardPatterns) {
      let m: RegExpExecArray | null;
      while ((m = p.re.exec(concat)) !== null) {
        cardMatches.push({ key: p.key, idx: m.index });
      }
    }
    // Sort by position
    cardMatches.sort((a, b) => a.idx - b.idx);

    // Helper to find last subtotal between start..end (relative to concat)
    const findLastSubtotalBetween = (start: number, end: number) => {
      const re = new RegExp(SUBTOTAL_REGEX.source, "gi");
      let last: number | null = null;
      let m: RegExpExecArray | null;
      while ((m = re.exec(concat)) !== null) {
        if (m.index >= start && m.index < end) last = m.index;
        if (m.index >= end) break;
      }
      return last;
    };

    // For each found card header, determine its snippet span
    for (let i = 0; i < cardMatches.length; i++) {
      const thisCard = cardMatches[i];
      const nextIdx =
        i + 1 < cardMatches.length ? cardMatches[i + 1].idx : concat.length;
      // We want to include continuation tables that may appear after a
      // SUBTOTAL if the next page contains a column header + rows that belong
      // to this card. Strategy:
      // 1. Look for any column header 'Data Descrição R$ US$' within this span.
      // 2. If one exists, prefer the last SUBTOTAL that appears after the
      //    last column header (so that rows following the header are captured
      //    up to that subtotal). If none found, fall back to last subtotal
      //    between thisCard and next card, or to nextIdx.
      let endIdx: number | null = null;
      // find last column header in span
      const colRe = /Data\s+Descri[cç][aã]o\s+R\$\s+US\$/gi;
      let lastColIdx: number | null = null;
      let cm2: RegExpExecArray | null;
      // reset lastIndex for safety
      colRe.lastIndex = 0;
      while ((cm2 = colRe.exec(concat)) !== null) {
        if (cm2.index > thisCard.idx && cm2.index < nextIdx)
          lastColIdx = cm2.index;
        if (cm2.index >= nextIdx) break;
      }

      if (lastColIdx !== null) {
        // find last SUBTOTAL after lastColIdx but before nextIdx
        const subRe = new RegExp(SUBTOTAL_REGEX.source, "gi");
        let lastSub: number | null = null;
        subRe.lastIndex = 0;
        let sm2: RegExpExecArray | null;
        while ((sm2 = subRe.exec(concat)) !== null) {
          if (sm2.index >= lastColIdx && sm2.index < nextIdx)
            lastSub = sm2.index;
          if (sm2.index >= nextIdx) break;
        }
        if (lastSub !== null) {
          endIdx = lastSub;
        } else {
          // fallback to last subtotal in whole span
          endIdx = findLastSubtotalBetween(thisCard.idx, nextIdx) ?? nextIdx;
        }
      } else {
        // no column header found — use previous logic: prefer the last subtotal
        endIdx = findLastSubtotalBetween(thisCard.idx, nextIdx);
        if (endIdx === null) {
          const re = new RegExp(SUBTOTAL_REGEX.source, "i");
          const sm = re.exec(concat.substring(thisCard.idx));
          if (sm) endIdx = thisCard.idx + sm.index;
        }
        if (endIdx === null) endIdx = nextIdx;
      }

      const snippet = concat.substring(thisCard.idx, endIdx).trim();
      result[thisCard.key] = snippet;
    }

    // Additionally: if there are column header blocks that don't have a preceding
    // explicit card header in the slice, try to assign them to the nearest prior
    // card (searching backwards in the full pages array including earlier pages).
    const columnRe = /Data\s+Descrição\s+R\$\s+US\$/gi;
    let cm: RegExpExecArray | null;
    while ((cm = columnRe.exec(concat)) !== null) {
      const colIdx = cm.index;
      // if this column header already sits inside an assigned snippet, skip
      const insideAssigned = Object.values(result).some((snip) => {
        const si = concat.indexOf(snip);
        return si >= 0 && colIdx >= si && colIdx < si + snip.length;
      });
      if (insideAssigned) continue;
      // find nearest prior card header before colIdx
      const prior = cardMatches.filter((c) => c.idx < colIdx).pop();
      if (prior) {
        // find subtotal after colIdx but before next card or end
        const nextIdx = (() => {
          const next = cardMatches.find((c) => c.idx > prior.idx);
          return next ? next.idx : concat.length;
        })();
        let endIdx = findLastSubtotalBetween(prior.idx, nextIdx);
        if (endIdx === null) {
          const re = new RegExp(SUBTOTAL_REGEX.source, "i");
          const sm = re.exec(concat.substring(colIdx));
          if (sm) endIdx = colIdx + sm.index;
        }
        if (endIdx === null) endIdx = nextIdx;
        const snippet = concat.substring(prior.idx, endIdx).trim();
        result[prior.key] = snippet;
      }
    }

    return result;
  }

  // ----------------------------------------------------------------
  // #endregion
  // #region Parsing (snippet -> structured records)
  // Parsing: snippet -> structured records
  // - `parseSnippetToRecords` converts a raw snippet into an array of
  //   normalized record objects { Data, Descrição, R$, US$ }.
  // - This section contains robust heuristics to handle page breaks,
  //   noisy headers/footers, and multiple currency columns.
  // ----------------------------------------------------------------

  function parseSnippetToRecords(snippet: string) {
    if (!snippet) return [] as Record<string, string>[];
    const norm = snippet
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      .replace(/\n+/g, "\n")
      .trim();
    // Don't trim at the first SUBTOTAL globally — that removed continuation
    // rows that appear after the page footer. Instead, remove the footer block
    // between SUBTOTAL and the next column header if present, and strip page
    // header blocks like 'Titular ... Vencimento <date>'. This preserves table
    // rows that continue after a page break.
    let working = norm;
    try {
      // remove SUBTOTAL + footer up to the next 'Data   Descrição' header
      working = working.replace(
        /Subtotal[\s\S]*?(?=Data\s+Descri[cç][aã]o)/i,
        "",
      );
    } catch {
      /* ignore */
    }
    // Remove page-level header/footer noise
    working = working
      .replace(/Titular[\s\S]*?Vencimento\s*\d{1,2}\/\d{1,2}\/\d{2,4}/gi, "")
      .replace(/Resumo da sua fatura/gi, "")
      .replace(/Limite de cr[eé]dito[\s\S]*?Limite utilizado/gi, "")
      .trim();
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
    const dates: { idx: number; text: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = dateRegex.exec(working)) !== null)
      dates.push({ idx: m.index, text: m[0] });
    const records: Record<string, string>[] = [];

    const normalizeAmount = (a: string) =>
      a.replace(/\s/g, "").replace(/[^0-9,\.\-]/g, "");

    // Primary parsing: segments anchored by date tokens
    if (dates.length > 0) {
      for (let i = 0; i < dates.length; i++) {
        const start = dates[i].idx;
        const end = i + 1 < dates.length ? dates[i + 1].idx : working.length;
        let segment = working.substring(start, end).trim();
        // Strip any trailing SUBTOTAL/footer that accidentally attached to this segment
        // (for instance: '... 149,48 Subtotal  +55 ...'). Keep the transaction only.
        segment = segment.replace(/Subtotal[\s\S]*/i, "");
        const dateMatch = segment.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/);
        const date = dateMatch ? dateMatch[0] : "";
        const amountRegex =
          /(?:R\$|US\$)?\s*-?\d{1,3}(?:[\.\s]\d{3})*[,\.]\d{2}/g;
        const amountsRaw = segment.match(amountRegex) || [];
        const amounts = amountsRaw.map((a) => normalizeAmount(a));
        let desc = segment.replace(date, "").trim();
        for (const a of amountsRaw)
          desc = desc
            .replace(a, "")
            .replace(/R\$|US\$/g, "")
            .trim();
        desc = desc
          .replace(/^[-–—\s]+/, "")
          .replace(/\s+[-–—]$/, "")
          .trim();
        // Remove stray header/footer tokens from the description
        desc = desc.replace(
          /Titular|Endere[cç]o|Vencimento|Resumo da sua fatura|As informa[cç][oõ]es deste demonstrativo/gi,
          "",
        );
        let rVal = "";
        let usVal = "";
        if (amounts.length >= 2) {
          rVal = amounts[0];
          usVal = amounts[1];
        } else if (amounts.length === 1) {
          rVal = amounts[0];
        }
        // filter out header-like or empty rows
        const isHeaderLike =
          /Data\s+Descri[cç][aã]o|Titular|Endere[cç]o|Vencimento|Resumo da sua fatura|As informa[cç][oõ]es deste demonstrativo/i.test(
            desc,
          );
        if (!isHeaderLike && (rVal || usVal || desc)) {
          records.push({ Data: date, Descrição: desc, R$: rVal, US$: usVal });
        }
      }
      return records;
    }

    // Fallback: line-based parsing when no dates were detected
    const lines = working
      .split(/\n|\r\n|\r/)
      .map((l) => l.trim())
      .filter(Boolean);
    const amountRegexFallback =
      /(?:R\$|US\$)?\s*-?\d{1,3}(?:[\.\s]\d{3})*[,\.]\d{2}/g;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const matches = line.match(amountRegexFallback);
      if (!matches) continue;
      const amounts = matches.map((a) => normalizeAmount(a));
      const dateMatch = (line.match(dateRegex) || []) as string[];
      const prevDateMatch =
        i > 0 ? ((lines[i - 1].match(dateRegex) || []) as string[]) : [];
      const date = (dateMatch[0] || prevDateMatch[0] || "").toString();
      let desc = line;
      for (const a of matches) desc = desc.replace(a, "");
      desc = desc
        .replace(/^[-–—\s]+/, "")
        .replace(/\s+[-–—]$/, "")
        .trim();
      let rVal = "";
      let usVal = "";
      if (amounts.length >= 2) {
        rVal = amounts[0];
        usVal = amounts[1];
      } else if (amounts.length === 1) {
        rVal = amounts[0];
      }
      const isHeaderLike =
        /Data\s+Descri[cç][aã]o|Titular|Endere[cç]o|Vencimento|Resumo da sua fatura/i.test(
          desc,
        ) ||
        (!rVal && !usVal && !date);
      if (!isHeaderLike)
        records.push({ Data: date, Descrição: desc, R$: rVal, US$: usVal });
    }
    return records;
  }

  function buildStructuredJSON(snipDefault?: string, snip7102?: string) {
    const keyDefault = "CARLOS A S VELOSO - 4998********2091";
    const key7102 = "CARLOS A S VELOSO - 4998********7102";
    const obj: Record<string, Record<string, string>[]> = {};
    const sd =
      typeof snipDefault === "string" ? snipDefault : page3Snippet2091 || "";
    const s7 = typeof snip7102 === "string" ? snip7102 : page3Snippet7102 || "";
    obj[keyDefault] = parseSnippetToRecords(sd);
    obj[key7102] = parseSnippetToRecords(s7);
    const pretty = JSON.stringify(obj, null, 2);
    setJsonOut(pretty);
    return obj;
  }

  // #endregion
  // #region Adapters (parsers -> transactions)

  // Adapter: convert parsed JSON ({ cardKey: [{Data, Descrição, R$, US$}] })
  // into Transaction[] expected by analyzeUploadConflicts
  function ricoAdapter(
    parsed: Record<string, Record<string, string>[]>,
  ): Transaction[] {
    const txns: Transaction[] = [];
    let idCounter = -1;

    const parseDate = (d: string) => {
      if (!d) return null;
      const m = (d || "").match(/(\d{1,2})\/(\d{1,2})\/(\d{2,4})/);
      if (m) {
        const day = m[1].padStart(2, "0");
        const month = m[2].padStart(2, "0");
        let year = m[3];
        if (year.length === 2) year = `20${year}`;
        return `${year}-${month}-${day}`;
      }
      return d || null;
    };

    const parseAmount = (a: string) => {
      if (!a) return 0;
      const s = String(a)
        .replace(/\s/g, "")
        .replace(/\./g, "")
        .replace(/,/g, ".")
        .replace(/[^0-9.\-]/g, "");
      const n = parseFloat(s);
      return isNaN(n) ? 0 : n;
    };

    for (const cardKey of Object.keys(parsed)) {
      const rows = parsed[cardKey] || [];
      for (const r of rows) {
        const row = r as Record<string, string>;
        const dateRaw = row.Data || row.Date || "";
        const descRaw = row["Descrição"] || row.Description || "";
        const rVal = row["R$"] || row.R || row.r || "";
        const usVal = row["US$"] || row.US || "";
        const amountStr = rVal || usVal || "";
        const amount = parseAmount(amountStr);
        const txn: Transaction = {
          id: idCounter--,
          Date: parseDate(dateRaw),
          Description: `${descRaw} ${cardKey}`.trim(),
          Amount: amount,
        } as Transaction;
        txns.push(txn);
      }
    }
    return txns;
  }

  // ----------------------------------------------------------------
  // Adapters & Filename parsing
  // - `ricoAdapter` transforms parsed card records into `Transaction[]`
  //   suitable for conflict analysis and upload.
  // - `parseRicoFilename` attempts to extract year/month from the
  //   uploaded filename to derive a target table name (RICO_YYYYMM).
  // ----------------------------------------------------------------

  // #region Adapters & Filename parsing

  // Parse Rico PDF filename and extract year/month for table naming
  function parseRicoFilename(
    filename: string | null,
  ): { year: string; month: string } | null {
    if (!filename) return null;
    const name = filename.replace(/\.[^.]+$/, "").trim();

    // Pattern 1: USERID(7-dig)-Rico-DD-MM-YYYY.pdf
    const p1 =
      /(?:^|\b)(\d{7})[-_ ]+Rico[-_ ]+(\d{2})[-_ ]+(\d{2})[-_ ]+(\d{4})(?:\b|$)/i;
    const m1 = name.match(p1);
    if (m1) {
      // m1[2] = DD, m1[3] = MM, m1[4] = YYYY
      const mon = m1[3].padStart(2, "0");
      const yr = m1[4];
      return { year: yr, month: mon };
    }

    // Pattern 2: Fatura-Rico-MMM-YY-USERID(7-dig).pdf (e.g., Fatura-Rico-Abr-25-1198922.pdf)
    // Accept 3-letter or full month names (Portuguese and English common abbreviations)
    const p2 =
      /Fatura[-_ ]+Rico[-_ ]+([A-Za-zÀ-ú]{3,9})[-_ ]+(\d{2})[-_ ]+(\d{7})/i;
    const m2 = name.match(p2);
    if (m2) {
      const monToken = m2[1].toLowerCase();
      const yy = m2[2];
      // Map common Portuguese and English month abbreviations/full names to month numbers
      const monthMap: Record<string, string> = {
        jan: "01",
        janeiro: "01",
        fev: "02",
        fevereiro: "02",
        mar: "03",
        março: "03",
        abr: "04",
        abril: "04",
        mai: "05",
        maio: "05",
        jun: "06",
        junho: "06",
        jul: "07",
        julho: "07",
        ago: "08",
        agosto: "08",
        set: "09",
        setembro: "09",
        out: "10",
        outubro: "10",
        nov: "11",
        novembro: "11",
        dez: "12",
        dezembro: "12",
        // English
        feb: "02",
        apr: "04",
        aug: "08",
        sep: "09",
        sept: "09",
        oct: "10",
        dec: "12",
      };
      // normalize token (strip accents and to ascii where possible)
      const normalize = (s: string) =>
        s
          .toLowerCase()
          .normalize("NFD")
          .replace(/[\u0300-\u036f]/g, "");
      const monNorm = normalize(monToken);
      const mon = monthMap[monNorm] || monthMap[monToken] || "";
      if (mon) {
        const year = yy.length === 2 ? `20${yy}` : yy;
        return { year, month: mon };
      }
    }

    // Fallback: try to find a YYYY and MM somewhere in the filename (YYYY[sep]MM)
    const p3 = /(\d{4})[-_ ]?(0[1-9]|1[0-2])/;
    const m3 = name.match(p3);
    if (m3) return { year: m3[1], month: m3[2] };

    return null;
  }

  // #endregion

  function onSubmitPassword(e?: React.FormEvent) {
    if (e) e.preventDefault();
    const pw = pwInputRef.current ? pwInputRef.current.value : "";
    setShowPassword(false);
    setProgress("Retrying with password...");
    if (latestArrayBuffer) {
      tryOpenAndExtract(latestArrayBuffer, pw).catch((err) => {
        console.error(err);
        setProgress("Error opening PDF");
      });
    }
  }

  // Handle resolved conflicts (called by MergeConflictDialog)
  const handleResolveConflicts = async (transactionsToAdd: Transaction[]) => {
    if (!conflictAnalysis) return;

    setShowMergeDialog(false);
    setUploadingFlow(true);

    const tableName = conflictAnalysis.tableName;

    try {
      const result = await uploadToSupabase(
        tableName,
        transactionsToAdd,
        false,
      );

      if (result.success) {
        // Category analysis
        try {
          setCategoryProgress({
            show: true,
            stage: "discovering",
            message: "Starting category analysis...",
            current: 0,
            total: 1,
          });
          const analysis = await analyzeCategoryMatches(
            tableName,
            transactionsToAdd,
            (progress: CategoryAnalysisProgress) => {
              setCategoryProgress({
                show: true,
                stage: progress.stage,
                message: progress.message,
                current: progress.current,
                total: progress.total,
              });
            },
          );
          setCategoryProgress({
            show: false,
            stage: "",
            message: "",
            current: 0,
            total: 0,
          });
          if (analysis.matches && analysis.matches.length > 0) {
            setCategoryAnalysis(analysis);
            setShowCategoryDialog(true);
          } else {
            setUploadSummary({
              show: true,
              success: true,
              message: "Upload Successful!",
              details: result.message,
            });
            if (pendingKey) await deletePendingPdf(pendingKey);
            router.push("/upload");
          }
        } catch (catErr) {
          console.error("Category analysis failed", catErr);
          setCategoryProgress({
            show: false,
            stage: "",
            message: "",
            current: 0,
            total: 0,
          });
          setUploadSummary({
            show: true,
            success: true,
            message: "Upload Successful!",
            details: `${result.message} (Category analysis skipped)`,
          });
          if (pendingKey) await deletePendingPdf(pendingKey);
          router.push("/upload");
        }
      } else {
        if ("error" in result && result.error === "TABLE_NOT_EXISTS") {
          const createResult = await executeTableCreation(tableName);
          if (createResult.success) {
            const retry = await uploadToSupabase(
              tableName,
              transactionsToAdd,
              false,
            );
            if (retry.success) {
              setUploadSummary({
                show: true,
                success: true,
                message: "Upload Successful!",
                details: retry.message,
              });
              if (pendingKey) await deletePendingPdf(pendingKey);
              router.push("/upload");
            } else {
              setUploadSummary({
                show: true,
                success: false,
                message: "Upload Failed",
                details: retry.message,
              });
            }
          } else {
            setUploadSummary({
              show: true,
              success: false,
              message: "Table Creation Failed",
              details: createResult.message,
            });
          }
        } else {
          setUploadSummary({
            show: true,
            success: false,
            message: "Upload Failed",
            details: result.message,
          });
        }
      }
    } catch (err) {
      console.error("Error uploading transactions:", err);
      setUploadSummary({
        show: true,
        success: false,
        message: "Upload Error",
        details: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setUploadingFlow(false);
      setConflictAnalysis(null);
    }
  };

  // ----------------------------------------------------------------
  // Handlers: upload/confirm flow
  // - `handleResolveConflicts`, `handleCancelMerge`, `handleCategoryComplete`
  //   and `handleCategorySkip` drive the confirm/upload/cleanup behavior
  //   after a user confirms parsed JSON and requests upload.
  // ----------------------------------------------------------------

  // #endregion
  // #region Handlers: upload/confirm flow

  const handleCancelMerge = () => {
    setShowMergeDialog(false);
    setConflictAnalysis(null);
    setUploadingFlow(false);
  };

  const handleCategoryComplete = () => {
    setShowCategoryDialog(false);
    setCategoryAnalysis(null);
    setUploadSummary({
      show: true,
      success: true,
      message: "Categories Applied Successfully!",
      details: "All transactions have been categorized and saved.",
    });
    if (pendingKey) deletePendingPdf(pendingKey).catch(() => {});
    router.push("/upload");
  };

  const handleCategorySkip = () => {
    setShowCategoryDialog(false);
    setCategoryAnalysis(null);
    setUploadSummary({
      show: true,
      success: true,
      message: "Upload Complete - Categorization Skipped",
      details:
        "Transactions remain as 'Unknown' category. You can categorize them later in the app.",
    });
    if (pendingKey) deletePendingPdf(pendingKey).catch(() => {});
    router.push("/upload");
  };

  // #endregion
  // #region Render / UI

  return (
    <div style={{ padding: 20 }}>
      <h1>PDF Text Extractor (pdf.js) — Next.js page</h1>
      <div
        style={{
          display: "flex",
          gap: 8,
          alignItems: "center",
          marginBottom: 12,
        }}
      >
        {reviewMode && (
          <div
            style={{
              padding: 8,
              background: "#063",
              color: "#cfff",
              borderRadius: 6,
            }}
          >
            Redirected from Upload
            {pendingFilename ? `: ${pendingFilename}` : ""}
            <div style={{ marginTop: 6 }}>
              <button
                onClick={async () => {
                  // Confirm: build JSON, adapt to transactions, analyze conflicts and open merge dialog
                  try {
                    setUploadingFlow(true);
                    const s1 = editableSnippet2091 || page3Snippet2091 || "";
                    const s2 = editableSnippet7102 || page3Snippet7102 || "";
                    const parsed = buildStructuredJSON(s1, s2);
                    const transactions = ricoAdapter(parsed);

                    // Determine a table name (simple convention: RICO_YYYYMM)
                    const now = new Date();
                    let year = String(now.getFullYear());
                    let month = String(now.getMonth() + 1).padStart(2, "0");
                    // Try to derive year/month from the uploaded filename (supports two Rico patterns)
                    const fileDateInfo = parseRicoFilename(pendingFilename);
                    if (fileDateInfo) {
                      year = fileDateInfo.year;
                      month = fileDateInfo.month.padStart(2, "0");
                    }
                    const tableName = `RICO_${year}${month}`;

                    const analysis = await analyzeUploadConflicts(
                      tableName,
                      transactions,
                      false,
                    );
                    setConflictAnalysis(analysis);
                    setShowMergeDialog(true);
                  } catch (err: unknown) {
                    console.error("Confirm flow failed", err);
                    const details =
                      err instanceof Error ? err.message : String(err);
                    setUploadSummary({
                      show: true,
                      success: false,
                      message: "Confirm failed",
                      details,
                    });
                  } finally {
                    setUploadingFlow(false);
                  }
                }}
                style={{ marginRight: 8 }}
              >
                Confirm JSON and Upload
              </button>
              <button
                onClick={async () => {
                  // Cancel: remove pending PDF and go back to upload
                  if (pendingKey) await deletePendingPdf(pendingKey);
                  router.push("/upload");
                }}
              >
                Cancel & Back
              </button>
            </div>
          </div>
        )}
        <input
          ref={fileRef}
          id="file-input"
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
        />
        <button onClick={onExtractClick} style={{ padding: "8px 12px" }}>
          Extract Text
        </button>
        <button
          onClick={() => {
            const blob = new Blob([extractedText], {
              type: "text/plain;charset=utf-8",
            });
            const url = URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = url;
            a.download = "extracted-text.txt";
            document.body.appendChild(a);
            a.click();
            a.remove();
            URL.revokeObjectURL(url);
          }}
        >
          Download .txt
        </button>
        <button
          onClick={() => {
            if (pageTexts && pageTexts.length >= 3) {
              alert(pageTexts[2] || "[page 3 has no text]");
            } else alert("[no extracted pages yet]");
          }}
        >
          Show Page 3
        </button>
        <span style={{ marginLeft: 8 }}>{progress}</span>
      </div>

      <div
        style={{
          whiteSpace: "pre-wrap",
          background: "#111",
          color: "#eee",
          padding: 12,
          borderRadius: 6,
          minHeight: 160,
        }}
      >
        {extractedText || "No text extracted yet."}
      </div>

      <h3>Page 3</h3>
      <div
        style={{
          whiteSpace: "pre-wrap",
          background: "#fff",
          color: "#111",
          padding: 12,
          borderRadius: 6,
          minHeight: 120,
          border: "1px solid #ddd",
        }}
      >
        {pageTexts && pageTexts[2] ? pageTexts[2] : "No page 3 content yet."}
      </div>

      <h3>Page 4</h3>
      <div
        style={{
          whiteSpace: "pre-wrap",
          background: "#fff",
          color: "#111",
          padding: 12,
          borderRadius: 6,
          minHeight: 120,
          border: "1px solid #ddd",
          marginTop: 12,
        }}
      >
        {pageTexts && pageTexts[3] ? pageTexts[3] : "No page 4 content yet."}
      </div>

      <h4>Extracted snippet from Page 3 (2091)</h4>
      <div
        style={{
          whiteSpace: "pre-wrap",
          background: "#f6f9ff",
          color: "#072",
          padding: 12,
          borderRadius: 6,
          minHeight: 80,
        }}
      >
        {page3Snippet2091 || "No snippet extracted yet."}
      </div>

      <h4>Editable snippet for 2091 (paste/trim here before converting)</h4>
      <div style={{ marginBottom: 8 }}>
        <textarea
          value={editableSnippet2091}
          onChange={(e) => setEditableSnippet2091(e.target.value)}
          placeholder="Paste or edit the snippet for 2091 here"
          rows={6}
          style={{ width: "100%", padding: 8, fontFamily: "monospace" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button
            onClick={() => setEditableSnippet2091(page3Snippet2091)}
            title="Copy auto-extracted snippet into editor"
          >
            Use extracted
          </button>
          <button onClick={() => setEditableSnippet2091("")}>Clear</button>
        </div>
      </div>

      <h4>Extracted snippet from Page 3 (7102)</h4>
      <div
        style={{
          whiteSpace: "pre-wrap",
          background: "#fff7f0",
          color: "#572",
          padding: 12,
          borderRadius: 6,
          minHeight: 80,
        }}
      >
        {page3Snippet7102 || "No snippet extracted yet."}
      </div>

      <h4>Editable snippet for 7102 (paste/trim here before converting)</h4>
      <div style={{ marginBottom: 8 }}>
        <textarea
          value={editableSnippet7102}
          onChange={(e) => setEditableSnippet7102(e.target.value)}
          placeholder="Paste or edit the snippet for 7102 here"
          rows={6}
          style={{ width: "100%", padding: 8, fontFamily: "monospace" }}
        />
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <button
            onClick={() => setEditableSnippet7102(page3Snippet7102)}
            title="Copy auto-extracted snippet into editor"
          >
            Use extracted
          </button>
          <button onClick={() => setEditableSnippet7102("")}>Clear</button>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
        <button
          onClick={() => {
            // Prefer edited snippets if present, otherwise fall back to auto snippets
            const s1 = editableSnippet2091 || page3Snippet2091 || "";
            const s2 = editableSnippet7102 || page3Snippet7102 || "";
            buildStructuredJSON(s1, s2);
          }}
          style={{ padding: "8px 12px" }}
        >
          Convert Edited to JSON
        </button>
        <button
          onClick={() => {
            // quick fallback: build from auto snippets
            buildStructuredJSON(page3Snippet2091, page3Snippet7102);
          }}
        >
          Convert Auto to JSON
        </button>
      </div>

      <h4>Structured JSON</h4>
      <pre
        style={{
          whiteSpace: "pre-wrap",
          background: "#f0f0f3",
          padding: 12,
          borderRadius: 6,
          minHeight: 120,
        }}
      >
        {jsonOut || "No JSON yet."}
      </pre>

      {/* Merge dialog for confirmed uploads */}
      {conflictAnalysis && (
        <MergeConflictDialog
          analysis={conflictAnalysis}
          onResolve={handleResolveConflicts}
          onCancel={handleCancelMerge}
          open={showMergeDialog}
        />
      )}

      {/* Category assignment dialog (optional) */}
      {categoryAnalysis && (
        <CategoryAssignmentDialog
          analysis={categoryAnalysis}
          onComplete={handleCategoryComplete}
          onSkip={handleCategorySkip}
          open={showCategoryDialog}
        />
      )}

      {/* Simple upload summary */}
      {uploadSummary.show && (
        <div
          style={{
            marginTop: 12,
            padding: 12,
            borderRadius: 6,
            background: uploadSummary.success ? "#073" : "#600",
            color: "#fff",
          }}
        >
          <strong>{uploadSummary.message}</strong>
          <div style={{ fontSize: 12 }}>{uploadSummary.details}</div>
        </div>
      )}

      {/* Password modal */}
      {showPassword && (
        <div
          style={{
            position: "fixed",
            left: 0,
            top: 0,
            right: 0,
            bottom: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "rgba(0,0,0,0.5)",
          }}
        >
          <form
            onSubmit={onSubmitPassword}
            style={{
              background: "#fff",
              padding: 18,
              borderRadius: 8,
              width: 360,
            }}
          >
            <label htmlFor="pdf-password">PDF Password</label>
            <input
              id="pdf-password"
              ref={pwInputRef}
              type="password"
              style={{ width: "100%", padding: 8, marginTop: 8 }}
            />
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "flex-end",
                marginTop: 8,
              }}
            >
              <button type="button" onClick={() => setShowPassword(false)}>
                Cancel
              </button>
              <button type="submit">Submit</button>
            </div>
            {pwMessage && (
              <p style={{ color: "#b00020", marginTop: 8 }}>{pwMessage}</p>
            )}
          </form>
        </div>
      )}
    </div>
  );
}

// #endregion Render / UI

// #endregion Component (Page)
