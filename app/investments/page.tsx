"use client";

import React from "react";

const FUNDS = [
  "Handelsbanken Amerika Tema (A1 SEK)",
  "Handelsbanken Asien Tema (A1 SEK)",
  "Handelsbanken AstraZeneca Allemansfond",
  "Handelsbanken Emerging M. Index (A1 SEK)",
  "Handelsbanken Global Digital (A1 SEK)",
  "Handelsbanken Global Index (A1 SEK)",
  "Handelsbanken Global Momentum (A1 SEK)",
  "Handelsbanken Hälsovård Tema (A1 SEK)",
  "Handelsbanken Norden Selektiv (A1 SEK)",
  "Handelsbanken Sverige Selektiv (A1 SEK)",
];

function hashStringToSeed(s: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619) >>> 0;
  }
  return h;
}

function seededRandom(seed: number) {
  // Simple xorshift32-like generator returning function that yields [0,1)
  let x = seed >>> 0;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) % 100000) / 100000;
  };
}

function generateMonthlySeries(name: string) {
  const seed = hashStringToSeed(name);
  const rnd = seededRandom(seed);
  // base NAV between 100 and 1000 SEK per unit (scaled)
  const base = 200 + Math.floor(rnd() * 800);
  const series: number[] = [];
  // generate 12 months for current year
  for (let m = 0; m < 12; m++) {
    // small monthly variation -10% .. +10%
    const pct = (rnd() - 0.5) * 0.2;
    const prev = m === 0 ? base : series[m - 1];
    const next = Math.max(1, prev * (1 + pct));
    series.push(Number(next.toFixed(2)));
  }
  return series;
}
// Mock NAV generator removed — page now only shows values fetched from Yahoo.

function formatSEK(v: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(v);
}

export default function InvestmentsPage() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const year = now.getFullYear();

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(year, i, 1).toLocaleString("sv-SE", { month: "short" }),
  );
  // Provide tickers for funds. Fill in tickers you know (example entries included).
  // You can add the Yahoo tickers (like `0P00000F82.ST`) for each fund here.
  const FUND_TICKERS: Record<string, string> = {
    // example mappings (you provided these two):
    "Handelsbanken Asien Tema (A1 SEK)": "0P00000F83.ST",
    "Handelsbanken Amerika Tema (A1 SEK)": "0P00000F82.ST",
    // add the rest (leave empty string to keep using mock values)
    "Handelsbanken AstraZeneca Allemansfond": "0P000083RV.ST",
    "Handelsbanken Emerging M. Index (A1 SEK)": "0P0001F3XG.ST",
    "Handelsbanken Global Digital (A1 SEK)": "0P0001QDLJ.ST",
    "Handelsbanken Global Index (A1 SEK)": "0P0001F3XN.ST",
    "Handelsbanken Global Momentum (A1 SEK)": "0P0001LS8Q.ST",
    "Handelsbanken Hälsovård Tema (A1 SEK)": "",
    "Handelsbanken Norden Selektiv (A1 SEK)": "0P000146XC.ST",
    "Handelsbanken Sverige Selektiv (A1 SEK)": "0P000148YN.ST",
  };

  const [data, setData] = React.useState(
    FUNDS.map((f) => ({
      name: f,
      series: Array(12).fill(null as number | null),
      loading: false,
      error: "",
    })),
  );

  const [loadingAll, setLoadingAll] = React.useState(false);

  async function fetchMonthlyFromYahoo(ticker: string) {
    // Use local proxy to avoid client-side CORS issues
    const url = `/api/yahoo/chart?ticker=${encodeURIComponent(ticker)}&range=1y&interval=1mo`;

    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();

    const result = json?.chart?.result?.[0];
    if (!result) throw new Error("No chart result");
    const timestamps: number[] = result.timestamp || [];
    const closes: (number | null)[] = (
      result.indicators?.quote?.[0]?.close || []
    ).map((v: any) => (v === null ? null : Number(v)));

    const map = new Map<number, number>();
    for (let i = 0; i < timestamps.length; i++) {
      const ts = timestamps[i] * 1000;
      const d = new Date(ts);
      const v = closes[i];
      // Only consider points that belong to the current calendar year
      if (d.getFullYear() !== year) continue;
      const m = d.getMonth();
      if (v != null) map.set(m, Number(v.toFixed(2)));
    }

    const series = Array.from({ length: 12 }, (_, i) => {
      const val = map.get(i);
      return val != null ? val : null;
    });

    return series;
  }

  React.useEffect(() => {
    let mounted = true;
    async function loadAll() {
      setLoadingAll(true);
      const promises = data.map(async (row) => {
        const ticker = FUND_TICKERS[row.name];
        if (!ticker) return row;
        try {
          const series = await fetchMonthlyFromYahoo(ticker);
          // Only use fetched values; leave other months null
          return { ...row, series: series, loading: false, error: "" };
        } catch (err: any) {
          return { ...row, loading: false, error: String(err) };
        }
      });

      const results = await Promise.all(promises);
      if (!mounted) return;
      setData(results);
      setLoadingAll(false);
    }

    loadAll();
    return () => {
      mounted = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h1>Investments — Sweden (Yahoo prototype)</h1>

      <p>
        This prototype fetches monthly closing prices from Yahoo Finance's chart
        endpoint for configured tickers. If a ticker is missing or Yahoo does
        not return a month, the corresponding cell will be empty. Note: in some
        environments Yahoo endpoints may block cross-origin requests; if you see
        CORS errors use a small server proxy (already included).
      </p>

      <div style={{ marginBottom: 8 }}>
        <strong>How to use:</strong>
        <ul>
          <li>
            Fill `FUND_TICKERS` above with the Yahoo tickers (e.g.
            `0P00000F82.ST`).
          </li>
          <li>
            The page will try to fetch monthly closes for the past 12 months.
          </li>
          <li>
            If fetch fails due to CORS, run a server proxy or fetch server-side.
          </li>
        </ul>
      </div>

      <div style={{ overflowX: "auto" }}>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={thStyle}>Fund</th>
              <th style={thStyle}>Current ({months[currentMonth]})</th>
              {months.map((m) => (
                <th key={m} style={thStyle} title={m}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row) => (
              <tr key={row.name}>
                <td style={tdStyle}>
                  <div style={{ fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    ticker: {FUND_TICKERS[row.name] || "(not set)"}
                  </div>
                  {row.error && (
                    <div style={{ color: "crimson", fontSize: 12 }}>
                      {row.error}
                    </div>
                  )}
                </td>
                <td style={tdStyleBold}>
                  {row.series[currentMonth] != null
                    ? formatSEK(row.series[currentMonth] as number)
                    : ""}
                </td>
                {row.series.map((v, i) => (
                  <td key={i} style={tdStyle}>
                    {v != null ? formatSEK(v as number) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 12 }}>
        <strong>Notes:</strong>
        <ul>
          <li>
            If you see network/CORS errors when fetching Yahoo endpoints, a
            simple server proxy (server-side API route) can call Yahoo and
            return the JSON to the client.
          </li>
          <li>
            Yahoo's chart API returns monthly data with timestamps; the
            prototype aligns results by month index (Jan=0..Dec=11). Missing
            months fall back to the mock generator values.
          </li>
        </ul>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "8px 10px",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "6px 10px",
  borderBottom: "1px solid #f1f1f1",
  whiteSpace: "nowrap",
};

const tdStyleBold: React.CSSProperties = {
  ...tdStyle,
  fontWeight: 700,
};
