"use client";

import React, { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    pdfjsLib: any;
  }
}

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

  // tolerant 'Subtotal' regex
  const SUBTOTAL_REGEX = /S\s*u\s*b\s*t\s*o\s*t\s*a\s*l/i;

  useEffect(() => {
    if (pdfLoaded && window.pdfjsLib && window.pdfjsLib.GlobalWorkerOptions) {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdn.jsdelivr.net/npm/pdfjs-dist/build/pdf.worker.min.js";
    }
  }, [pdfLoaded]);

  // Load pdf.js by injecting a script tag (more reliable than Next's Script in some dev setups)
  function loadPdfJsFromCdn(): Promise<void> {
    if ((window as any).pdfjsLib) {
      setPdfLoaded(true);
      return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
      // Avoid adding multiple script tags
      if (document.querySelector("script[data-pdfjs]")) {
        // Poll for availability
        const t0 = Date.now();
        const id = setInterval(() => {
          if ((window as any).pdfjsLib) {
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
      s.onerror = (e) => reject(new Error("Failed to load pdf.js script"));
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

  // Wait for the pdf.js script to be available (with timeout)
  async function ensurePdfJsLoaded(timeout = 8000) {
    if ((window as any).pdfjsLib) return;
    try {
      await loadPdfJsFromCdn();
    } catch (e) {
      // fallback to polling if injection didn't initialize the global
    }
    const start = Date.now();
    return new Promise<void>((resolve, reject) => {
      const id = setInterval(() => {
        if ((window as any).pdfjsLib) {
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
    } catch (err: any) {
      console.error(err);
      setProgress("Extraction failed");
      setExtractedText(
        "Error: " + (err && err.message ? err.message : String(err)),
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
    } catch (err) {
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
      await extractAllText(pdf);
      setProgress("Extraction complete");
      return;
    } catch (err: any) {
      const msg = (err && (err.message || err.toString())) || "";
      const needsPassword =
        /password/i.test(msg) || (err && err.name === "PasswordException");
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

  async function extractAllText(pdf: any) {
    let accum = "";
    const num = pdf.numPages;
    const pages: string[] = [];
    for (let i = 1; i <= num; i++) {
      setProgress(`Extracting page ${i} / ${num}...`);
      try {
        const page = await pdf.getPage(i);
        const content = await page.getTextContent();
        const strings = content.items.map((item: any) => item.str);
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
    } catch (e) {
      console.error("post-page extraction failed", e);
    }
  }

  function extractSnippet2091FromText(text: string) {
    if (!text) return "";
    const normalized = text.replace(/\r/gi, "");
    const specificRegex = /CARLOS\s+A\s+S\s+VELOSO\s*-\s*4998\*+2091/i;
    const match = specificRegex.exec(normalized);
    if (!match) return "";
    const startIndex = match.index;
    const afterMatch = normalized.substring(startIndex + match[0].length);
    const subtotalMatch = SUBTOTAL_REGEX.exec(afterMatch);
    let endIndex = subtotalMatch
      ? startIndex + match[0].length + subtotalMatch.index
      : normalized.length;
    const snippet = normalized.substring(startIndex, endIndex).trim();
    setPage3Snippet2091(snippet);
    return snippet;
  }

  function extractSnippet7102FromText(text: string) {
    if (!text) return "";
    const normalized = text.replace(/\r/gi, "");
    const specificRegex = /CARLOS\s+A\s+S\s+VELOSO\s*-\s*4998\*+7102/i;
    const match = specificRegex.exec(normalized);
    if (!match) return "";
    const startIndex = match.index;
    const afterMatch = normalized.substring(startIndex + match[0].length);
    const subtotalMatch = SUBTOTAL_REGEX.exec(afterMatch);
    let endIndex = subtotalMatch
      ? startIndex + match[0].length + subtotalMatch.index
      : normalized.length;
    const snippet = normalized.substring(startIndex, endIndex).trim();
    setPage3Snippet7102(snippet);
    return snippet;
  }

  // Search for a card match starting at a given page index and continue across
  // subsequent pages until SUBTOTAL is found (useful when tables split across pages)
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

  function parseSnippetToRecords(snippet: string) {
    if (!snippet) return [] as any[];
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
    } catch (e) {
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
    const records: any[] = [];

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
    const obj: any = {};
    const sd =
      typeof snipDefault === "string" ? snipDefault : page3Snippet2091 || "";
    const s7 = typeof snip7102 === "string" ? snip7102 : page3Snippet7102 || "";
    obj[keyDefault] = parseSnippetToRecords(sd);
    obj[key7102] = parseSnippetToRecords(s7);
    const pretty = JSON.stringify(obj, null, 2);
    setJsonOut(pretty);
    return obj;
  }

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
