import Papa from "papaparse";

export interface MonthlyData {
  month: string;
  interAcc: number;
  interCreditCard: number;
  interInvest: number;
  ricoCreditCard: number;
  ricoInvest: number;
  fgts: number;
  mae: number;
  handelsbankenAcc: number;
  handelsbankenInvest: number;
  amexCreditCard: number;
  sjPrioCreditCard: number;
  total: number;
}

export async function loadFinancialData(): Promise<MonthlyData[]> {
  const response = await fetch("/data/financial-data.csv");
  const csvText = await response.text();

  return new Promise((resolve, reject) => {
    Papa.parse<MonthlyData>(csvText, {
      header: true,
      dynamicTyping: true,
      skipEmptyLines: true,
      complete: (results) => {
        // Calculate the total for each row
        const dataWithCalculatedTotals = results.data.map((row) => ({
          ...row,
          total:
            row.interAcc +
            row.interCreditCard +
            row.interInvest +
            row.ricoCreditCard +
            row.ricoInvest +
            row.fgts +
            row.mae +
            row.handelsbankenAcc +
            row.handelsbankenInvest +
            row.amexCreditCard +
            row.sjPrioCreditCard,
        }));
        resolve(dataWithCalculatedTotals);
      },
      error: (error: Error) => {
        reject(error);
      },
    });
  });
}
