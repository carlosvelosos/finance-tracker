import { NextResponse } from "next/server";

// Server-side proxy for Yahoo Finance chart API to avoid CORS issues from the browser.
// Usage: /api/yahoo/chart?ticker=0P00000F82.ST&range=1y&interval=1mo
export async function GET(req: Request) {
  try {
    const urlObj = new URL(req.url);
    const ticker = urlObj.searchParams.get("ticker");
    const range = urlObj.searchParams.get("range") || "1y";
    const interval = urlObj.searchParams.get("interval") || "1mo";

    if (!ticker) {
      return NextResponse.json({ error: "missing ticker" }, { status: 400 });
    }

    // Basic validation to avoid SSRF abuse - allow common ticker chars
    if (!/^[A-Za-z0-9._\-]+$/.test(ticker)) {
      return NextResponse.json({ error: "invalid ticker" }, { status: 400 });
    }

    const target = `https://query1.finance.yahoo.com/v7/finance/chart/${encodeURIComponent(
      ticker,
    )}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}`;

    const upstream = await fetch(target, {
      headers: {
        // polite user-agent
        "User-Agent": "finance-tracker-proxy/1.0",
      },
    });

    const body = await upstream.text();

    const res = new NextResponse(body, { status: upstream.status });
    // forward content-type, ensure JSON
    res.headers.set(
      "content-type",
      upstream.headers.get("content-type") || "application/json",
    );
    // Allow browser access (dev). For production you may want to restrict origin.
    res.headers.set("Access-Control-Allow-Origin", "*");
    res.headers.set("Cache-Control", "s-maxage=60, stale-while-revalidate=120");
    return res;
  } catch (err: any) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
