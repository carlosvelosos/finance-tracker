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

// Mock NAV generator removed — page now only shows values from the JSON file and server refresh.

function formatSEK(v: number) {
  return new Intl.NumberFormat("sv-SE", {
    style: "currency",
    currency: "SEK",
  }).format(v);
}

export default function InvestmentsPage() {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();

  const months = Array.from({ length: 12 }, (_, i) =>
    new Date(currentYear, i, 1).toLocaleString("sv-SE", { month: "short" }),
  );
  // We'll load initial data from the public JSON file. The file also stores tickers.
  type Fund = {
    name: string;
    ticker?: string;
    months?: (number | null)[];
    error?: string;
    _lastRefreshError?: string;
  };

  const [swedishData, setSwedishData] = React.useState<Fund[]>([]);
  const [brazilData, setBrazilData] = React.useState<Fund[]>([]);
  const [fileYear, setFileYear] = React.useState<number | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  // Load initial JSON from public folder
  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/data/investiments-page/investments.json");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        setFileYear(json.year || new Date().getFullYear());
        // Normalize funds structure
        setFileYear(json.year || new Date().getFullYear());
        // cast incoming JSON to Fund[] conservatively
        setSwedishData(((json.funds || []) as Fund[]).map((f) => ({ ...f })));
        setBrazilData(
          ((json.brazilFunds || []) as Fund[]).map((f) => ({ ...f })),
        );
      } catch (err) {
        console.error("Failed to load investments json", err);
        // fallback: initialize empty rows from FUNDS list
        setSwedishData(
          FUNDS.map((f) => ({
            name: f,
            ticker: "",
            months: Array(12).fill(null),
            error: "failed to load",
          })),
        );
      }
    }
    load();
  }, []);

  // No automatic Yahoo fetching; user must click Refresh to update current month
  // No automatic Yahoo fetching; user must click Refresh to update current month

  async function handleRefresh() {
    setRefreshing(true);
    try {
      const res = await fetch("/api/investments/refresh", { method: "POST" });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      // updated doc returned under json.updated
      const updated = json.updated;
      if (updated) {
        setFileYear(updated.year || currentYear);
        setSwedishData(
          ((updated.funds || []) as Fund[]).map((f) => ({ ...f })),
        );
        setBrazilData(
          ((updated.brazilFunds || []) as Fund[]).map((f) => ({ ...f })),
        );
      }
    } catch (err) {
      console.error("Refresh failed", err);
      // preserve existing data
    }
    setRefreshing(false);
  }

  return (
    <div style={{ padding: 16 }}>
      <h1>Investments — Sweden (Yahoo prototype)</h1>

      <p>
        This prototype fetches monthly closing prices from Yahoo Finance&apos;s
        chart endpoint for configured tickers. If a ticker is missing or Yahoo
        does not return a month, the corresponding cell will be empty. Note: in
        some environments Yahoo endpoints may block cross-origin requests; if
        you see CORS errors use a small server proxy (already included).
      </p>

      <div style={{ marginBottom: 8 }}>
        <strong>How to use:</strong>
        <ul>
          <li>
            Make sure each fund in the JSON file has the correct `ticker` (Yahoo
            symbol).
          </li>
          <li>
            Click <strong>Refresh data</strong> to fetch the current
            month&apos;s value from Yahoo and update the local JSON file.
          </li>
          <li>
            If fetch fails due to network/Yahoo changes, check the server logs
            and retry.
          </li>
        </ul>
      </div>

      <div style={{ marginBottom: 12 }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{ padding: "8px 12px", fontSize: 14 }}
        >
          {refreshing ? "Refreshing..." : "Refresh data"}
        </button>
        {fileYear && (
          <span style={{ marginLeft: 12 }}>Data year: {fileYear}</span>
        )}
      </div>

      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed" as const,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "360px" }}>Fund</th>
              <th style={thStyle}>Current ({months[currentMonth]})</th>
              {months.map((m) => (
                <th key={m} style={thStyle} title={m}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {swedishData.map((row) => (
              <tr key={row.name}>
                <td style={{ ...tdStyle, width: "360px" }}>
                  <div style={{ fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    ticker: {row.ticker || "(not set)"}
                  </div>
                  {row.error && (
                    <div style={{ color: "crimson", fontSize: 12 }}>
                      {row.error}
                    </div>
                  )}
                </td>
                <td style={tdStyleBold}>
                  {row.months && row.months[currentMonth] != null
                    ? formatSEK(row.months[currentMonth] as number)
                    : ""}
                </td>
                {(row.months && row.months.length === 12
                  ? row.months
                  : Array(12).fill(null)
                ).map((v: number | null, i: number) => (
                  <td key={i} style={tdStyle}>
                    {v != null ? formatSEK(v as number) : ""}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Brazil table */}
      <h2 style={{ marginTop: 28 }}>Investments — Brazil</h2>
      <div style={{ overflowX: "auto" }}>
        <table
          style={{
            borderCollapse: "collapse",
            width: "100%",
            tableLayout: "fixed" as const,
          }}
        >
          <thead>
            <tr>
              <th style={{ ...thStyle, width: "360px" }}>Fund</th>
              <th style={thStyle}>Current ({months[currentMonth]})</th>
              {months.map((m) => (
                <th key={m} style={thStyle} title={m}>
                  {m}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {brazilData.map((row) => (
              <tr key={row.name}>
                <td style={{ ...tdStyle, width: "360px" }}>
                  <div style={{ fontWeight: 600 }}>{row.name}</div>
                  <div style={{ fontSize: 12, color: "#666" }}>
                    ticker: {row.ticker || "(not set)"}
                  </div>
                  {row.error && (
                    <div style={{ color: "crimson", fontSize: 12 }}>
                      {row.error}
                    </div>
                  )}
                </td>
                <td style={tdStyleBold}>
                  {row.months && row.months[currentMonth] != null
                    ? formatSEK(row.months[currentMonth] as number)
                    : ""}
                </td>
                {(row.months && row.months.length === 12
                  ? row.months
                  : Array(12).fill(null)
                ).map((v: number | null, i: number) => (
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
            Yahoo&apos;s chart API returns monthly data with timestamps; the
            prototype aligns results by month index (Jan=0..Dec=11). Missing
            months will be empty in the table until you refresh.
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
