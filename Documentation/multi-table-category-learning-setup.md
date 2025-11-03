# Universal Multi-Table Category Learning - Setup Guide

## 🎯 What This Does

The system learns from **ALL transaction tables across ALL banks** to provide the most accurate category suggestions possible!

**Why this is amazing:**

✨ **Cross-bank intelligence**: Spotify on SEB gets the same category as Spotify on Inter  
✨ **Historical learning**: Years of data = better suggestions  
✨ **Zero configuration**: Just categorize transactions naturally  
✨ **Automatic improvement**: More categorized data = better accuracy over time

**Example:**

- You've categorized 200 transactions in `SEB_202501` (Swedish bank)
- You've categorized 180 transactions in `INMC_202502` (Brazilian bank)
- You've categorized 150 transactions in `HB_2024` (Handelsbanken)
- You upload new data → System uses **530+ transactions across ALL banks** to suggest categories!
- Common expenses like "Netflix", "Spotify" get instant high-confidence matches regardless of which bank account!

## ⚡ Quick Setup (No installation needed!)

### ✅ Already Done!

The multi-table category learning feature uses the **same database function** that the `global_2` aggregated transactions page uses: `get_user_accessible_tables()`.

**If you can access `/global_2` in your app, the feature is already active!**

No additional setup, no new SQL functions, no configuration needed.

### How to Verify It's Working

Next time you upload bank statements:

1. Open browser **Console** (F12 → Console tab)
2. Upload a file
3. Look for these messages:
   - `Found X total transaction tables for category analysis: [...]`
   - `Analyzing categories using X table(s) across ALL banks: [...]`
   - `Found X categorized transactions in 'TABLE_NAME'` (repeated for each table)

You should see **all your transaction tables** being queried, not just the current bank!

## 🏦 Supported Banks

**ALL BANKS!** The system uses every transaction table in your database:

| Table Type                  | Example Tables                                         | What It Means                           |
| --------------------------- | ------------------------------------------------------ | --------------------------------------- |
| **Time-based (Monthly)**    | `SEB_202501`, `INMC_202502`, `AM_202503`               | Monthly bank statements                 |
| **Time-based (Yearly)**     | `IN_2024`, `HB_2025`                                   | Yearly aggregated data                  |
| **Aggregated**              | `Brasil_transactions_agregated_2025`                   | Multi-month/year aggregations           |
| **Single table**            | `handelsbanken_transactions`                           | All-in-one table                        |
| **Any transaction table**   | Any table discovered by `get_user_accessible_tables()` | Anything that shows up in global_2 page |
| **Inter Account (Monthly)** | `INACC_YYYYMM`                                         | `INACC_202501`, `INACC_202502`          |
| **Inter Account (Yearly)**  | `IN_YYYY`                                              | `IN_2024`, `IN_2025`                    |
| **Handelsbanken**           | `HB_YYYY`                                              | `HB_2024`, `HB_2025`                    |
| **American Express**        | `AM_YYYYMM`                                            | `AM_202501`, `AM_202502`                |

Banks with **single tables** (like `handelsbanken_transactions`) work as before - no change needed.

## ❓ FAQ

### Q: Does it really use ALL my tables?

**A:** Yes! Every table that appears in the global_2 page will be used for category learning. This includes:

- All Swedish bank tables (SEB, Handelsbanken, AmEx)
- All Brazilian bank tables (Inter Mastercard, Inter Account)
- Aggregated tables
- Historical tables from previous years
- **Everything!**

### Q: Won't this be slow with many tables?

**A:** Surprisingly fast!

- Fetches happen in parallel where possible
- Only queries for categorized transactions (filters out "Unknown")
- Client-side similarity matching is instant
- Typical: 10-20 tables = 2-3 seconds total
- The wait is worth it for accurate suggestions!

### Q: What if the same merchant appears with different names?

**A:** The similarity algorithm handles this:

- "Spotify Premium" and "Spotify" → Both match
- "Netflix Brasil" and "Netflix Subscription" → High similarity score
- Amount matching bonus helps confirm it's the same merchant
- Multiple examples from different banks increase confidence

### Q: Will it mix up categories between different banks?

**A:** No! It's smarter than that:

- The algorithm finds the **most common** category for similar transactions
- If you consistently categorize "Netflix" as "Streaming" across all banks, suggestions will be consistent
- If you accidentally miscategorized something once, the majority wins
- More data = more consensus = more accuracy

### Q: Do I need to re-categorize existing transactions?

**A:** No! The system automatically finds all transactions that already have categories and uses them as training data.

### Q: Can I exclude certain tables from learning?

**A:** Not yet, but you could modify the code if needed. The current approach of "use everything" generally produces the best results.

## 🔍 Troubleshooting

### Console shows "RPC function 'get_user_accessible_tables' not available"

**This is very unlikely** since this function is required for the global_2 page.

**Solution:** Check if you can access `/global_2` in your app:

1. Navigate to the Global 2 page
2. If it loads tables, the function exists
3. If category matching still fails, check browser console for other errors

### Function exists but not finding related tables

**Possible causes:**

1. Table naming doesn't follow the expected pattern (needs `PREFIX_YYYYMM` or `PREFIX_YYYY`)
2. Check console logs - it should show which tables were found
3. Verify tables exist using global_2 page table selection panel

### Categories not improving with more data

**Possible causes:**

1. ✅ Make sure you're actually categorizing transactions in older tables
2. ✅ Check that categories are not "Unknown" or "Uncategorized"
3. ✅ Verify table naming follows the pattern (`PREFIX_YYYYMM` or `PREFIX_YYYY`)
4. ✅ Check browser console for "Found X related tables" message

## 📚 More Information

- **Full Documentation**: `Documentation/category-assignment-feature.md`
- **SQL Function Reference**: `Documentation/supabase-get-tables-by-prefix-function.sql`
- **Testing Guide**: See "Test Case 6: Multi-Table Learning" in main docs

## 💡 Pro Tips

1. **Categorize consistently**: Use the same category names across months
2. **Start early**: The more historical data, the better the suggestions
3. **Review suggestions**: High confidence (>85%) is usually accurate
4. **Use bulk actions**: "Accept All High Confidence" saves time
5. **Monitor console**: Check that all tables are being found and queried

---

**Questions?** Check the full documentation or open an issue on GitHub.
