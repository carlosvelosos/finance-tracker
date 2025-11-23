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
        if (i === 3) {
          // auto-extract snippets from page 3
          try {
            const s1 = extractSnippet2091FromText(pageText);
            setPage3Snippet2091(s1);
          } catch (e) {
            console.error("auto extract default failed", e);
          }
          try {
            const s2 = extractSnippet7102FromText(pageText);
            setPage3Snippet7102(s2);
          } catch (e) {
            console.error("auto extract 7102 failed", e);
          }
          try {
            const obj = buildStructuredJSON();
            setJsonOut(JSON.stringify(obj, null, 2));
          } catch (e) {
            console.error("buildStructuredJSON failed", e);
          }
        }
        accum += `\n\n--- Page ${i} ---\n\n` + pageText;
      } catch (err) {
        console.error("Error extracting page", i, err);
        accum += `\n\n--- Page ${i} [error extracting] ---\n\n`;
      }
    }
    setExtractedText(accum);
    setPageTexts(pages);
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

  function parseSnippetToRecords(snippet: string) {
    if (!snippet) return [] as any[];
    const norm = snippet
      .replace(/\r/g, "")
      .replace(/\t/g, " ")
      .replace(/\n+/g, "\n")
      .trim();
    const dateRegex = /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/g;
    const dates: { idx: number; text: string }[] = [];
    let m: RegExpExecArray | null;
    while ((m = dateRegex.exec(norm)) !== null)
      dates.push({ idx: m.index, text: m[0] });
    const records: any[] = [];
    if (dates.length === 0) return records;
    for (let i = 0; i < dates.length; i++) {
      const start = dates[i].idx;
      const end = i + 1 < dates.length ? dates[i + 1].idx : norm.length;
      const segment = norm.substring(start, end).trim();
      const dateMatch = segment.match(/\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/);
      const date = dateMatch ? dateMatch[0] : "";
      const amountRegex = /-?\d{1,3}(?:[\.\s]\d{3})*[,\.]\d{2}/g;
      const amounts = (segment.match(amountRegex) || []).map((a) =>
        a.replace(/\s/g, ""),
      );
      let desc = segment.replace(date, "").trim();
      for (const a of amounts) desc = desc.replace(a, "").trim();
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
      records.push({ Data: date, Descrição: desc, R$: rVal, US$: usVal });
    }
    return records;
  }

  function buildStructuredJSON() {
    const keyDefault = "CARLOS A S VELOSO - 4998********2091";
    const key7102 = "CARLOS A S VELOSO - 4998********7102";
    const obj: any = {};
    obj[keyDefault] = parseSnippetToRecords(page3Snippet2091 || "");
    obj[key7102] = parseSnippetToRecords(page3Snippet7102 || "");
    setJsonOut(JSON.stringify(obj, null, 2));
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
