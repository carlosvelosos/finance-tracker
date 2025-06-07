# Main

The application has 4 major sections, Bank account, Transactions, Upload Files and Email Tools.

## Bank account

The bank account section is divided by country. Sweden and Brazil are the two coundtries supported currently.

### Sweden (Sverige)

For Sweden, we currently support **Handelbanken bank account** and **SEB SJ Prio Mastercard** and **American Express** credit cards.

> **Handelbanken**

| Feature               | Detail                                                       |
| --------------------- | ------------------------------------------------------------ |
| Page                  | https://finance-tracker-steel-five.vercel.app/handelsbanken/ |
| Supabase major table  | Sweden_transactions_agregated_2025                           |
| Supabase minor tables |                                                              |

**User Work flow**

1. Go to https://secure.handelsbanken.se/se/private/sv/accounts_and_cards/account_transactions
2. Select first and last month day
3. Export PDF and XLSX files
4. Rename the file by adding irst and last day `___YYYMMDD-YYYMMDD`
5. Copy the files to the driver https://drive.google.com/drive/folders/1dLNTT7MkifemZiYcEjLa7MvIXtm8I2Wh?usp=drive_link
6. Upload it to supabase using https://finance-tracker-steel-five.vercel.app/upload/

**Code work flow**

1. File uploaded and bank account selected at `app\upload\page.tsx`
2. `app\upload\page.tsx` call `uploadExcel` from `app\actions\fileActions.ts`

```
import { uploadExcel } from "@/app/actions/fileActions";

const result = await uploadExcel(file, selectedBank);
```

3. `app\actions\fileActions.ts` call `processHandelsbanken` from `lib\utils\bankProcessors.ts`

```
import { processDEV, processInterBR, processHandelsbanken, processAmex, processSEB } from "@/lib/utils/bankProcessors";

case "Handelsbanken-SE":
    processedData = processHandelsbanken(data);
```

4.`processHandelsbanken` at `lib\utils\bankProcessors.ts` processes the input excel file and returns `{ tableName, transactions }`

```
export function processHandelsbanken(data: string[][]) {
  // Extract the year from row 6: "Period: 2025-01-01 - 2025-03-24"
  const periodRow = data[6]?.[0] || "";
  const yearMatch = periodRow.match(/(\d{4})-/);
  const year = yearMatch ? yearMatch[1] : new Date().getFullYear(); // Default to current year if missing

  // Determine table name
  const tableName = `HB_${year}`;

  // Start processing transactions (row 9 onwards)
  const transactions = data.slice(9) // Skip metadata rows
    .filter(row => row.length >= 5) // Ensure row has enough columns
    .map((row, index) => ({
      id: index + 1, // Sequential ID
      Date: row[1], // Transaktionsdatum -> Date
      Description: row[2], // Text -> Description
      Amount: parseFloat(String(row[3]).replace(",", ".")), // Belopp -> Amount (convert to float)
      Balance: parseFloat(String(row[4]).replace(",", ".")), // Saldo -> Balance (convert to float)
    }));

  if (transactions.length === 0) {
    throw new Error("No transactions found in the file.");
  }

  return { tableName, transactions };
}
```

5. `app\actions\fileActions.ts` call `uploadToSupabase` where data is appended to the correct year handelsbanken table.

```
// Upload to Supabase
return await uploadToSupabase(processedData.tableName, processedData.transactions);

async function uploadToSupabase(tableName: string, transactions: Record<string, unknown>[]) {
  try {
    // Get the current highest ID from the table
    const { data: maxIdData, error: maxIdError } = await supabase
      .from(tableName)
      .select('id')
      .order('id', { ascending: false })
      .limit(1);

    if (maxIdError && maxIdError.code !== 'PGRST116') { // PGRST116 = table doesn't exist
      throw new Error(maxIdError.message);
    }

    // Calculate the starting ID for new records
    const currentMaxId = maxIdData && maxIdData.length > 0 ? maxIdData[0].id : 0;

    // Update transaction IDs to continue from the current max
    const transactionsWithCorrectIds = transactions.map((transaction, index) => ({
      ...transaction,
      id: currentMaxId + index + 1
    }));

    const { error } = await supabase.from(tableName).insert(transactionsWithCorrectIds);
    if (error) throw new Error(error.message);
    return `Upload successful! ${transactionsWithCorrectIds.length} records inserted into ${tableName} starting from ID ${currentMaxId + 1}`;
  } catch (error) {
    return `Error uploading to Supabase: ${error instanceof Error ? error.message : "Unknown error"}`;
  }
}
```
