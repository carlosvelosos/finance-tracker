import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

async function fetchCurrentMonthValueForTicker(ticker: string) {
  // Fetch daily data for the current month and return the last close price if available
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const period1 = Math.floor(startOfMonth.getTime() / 1000);
  const period2 = Math.floor(now.getTime() / 1000);

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    ticker,
  )}?period1=${period1}&period2=${period2}&interval=1d`;

  const res = await fetch(url, {
    headers: { "User-Agent": "finance-tracker-refresh/1.0" },
  });
  if (!res.ok) throw new Error(`Yahoo HTTP ${res.status}`);
  const json = await res.json();

  const result = json?.chart?.result?.[0];
  if (!result) throw new Error("No chart result");
  const closes: (number | null)[] = (
    result.indicators?.quote?.[0]?.close || []
  ).map((v: any) => (v === null ? null : Number(v)));

  // find last non-null close
  for (let i = closes.length - 1; i >= 0; i--) {
    const v = closes[i];
    if (v != null) return Number(v.toFixed(2));
  }
  return null;
}

export async function POST(req: Request) {
  try {
    const cwd = process.cwd();
    const filePath = path.join(
      cwd,
      "public",
      "data",
      "investiments-page",
      "investments.json",
    );

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: "data file not found" },
        { status: 404 },
      );
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const doc = JSON.parse(raw);
    const year = doc.year || new Date().getFullYear();
    const now = new Date();
    const currentMonth = now.getMonth();

    // iterate funds and fetch current month value for each ticker
    for (const fund of doc.funds) {
      const ticker = fund.ticker;
      if (!ticker) continue;
      try {
        const value = await fetchCurrentMonthValueForTicker(ticker);
        // only set if we have a number
        if (value != null) {
          if (!Array.isArray(fund.months) || fund.months.length < 12) {
            fund.months = Array(12).fill(null);
          }
          // ensure we never set future months — only current month
          if (currentMonth <= new Date().getMonth()) {
            fund.months[currentMonth] = value;
          }
        }
      } catch (err) {
        // continue on errors per-fund; include error field if needed
        fund._lastRefreshError = String(err);
      }
    }

    // Also refresh any brazilFunds if present
    if (Array.isArray(doc.brazilFunds)) {
      for (const fund of doc.brazilFunds) {
        const ticker = fund.ticker;
        if (!ticker) continue;
        try {
          const value = await fetchCurrentMonthValueForTicker(ticker);
          if (value != null) {
            if (!Array.isArray(fund.months) || fund.months.length < 12) {
              fund.months = Array(12).fill(null);
            }
            if (currentMonth <= new Date().getMonth()) {
              fund.months[currentMonth] = value;
            }
          }
        } catch (err) {
          fund._lastRefreshError = String(err);
        }
      }
    }

    // write back the file (pretty-printed)
    fs.writeFileSync(filePath, JSON.stringify(doc, null, 2), "utf8");

    return NextResponse.json({ ok: true, updated: doc });
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
