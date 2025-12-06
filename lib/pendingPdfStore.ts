// Minimal IndexedDB-backed pending PDF store
// Provides savePendingPdf, loadPendingPdf, deletePendingPdf

type PendingRecord = {
  key: string;
  filename: string;
  blob: Blob;
  createdAt: number;
};

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("finance-tracker-pending-pdfs", 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains("pending")) {
        db.createObjectStore("pending");
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/**
 * Persist a pending PDF to client-side IndexedDB for later processing.
 *
 * Purpose:
 * - Temporarily store an uploaded PDF (from the Upload page) so that the
 *   Rico PDF parser route can retrieve and parse it asynchronously.
 *
 * Behavior:
 * - Opens the `finance-tracker-pending-pdfs` IndexedDB database and writes
 *   a record into the `pending` object store.
 * - Generates a unique key in the form: `rico-<timestamp>-<random>` which is
 *   returned to the caller. That key is used by the parser route to look up
 *   the stored PDF (see `loadPendingPdf`/`deletePendingPdf`).
 * - The stored record includes the original filename, the blob (File), and
 *   a `createdAt` timestamp. Records are intended for short-term storage; use
 *   `cleanupOldPendingPdfs()` to purge stale entries.
 *
 * Parameters:
 * @param file - The `File` object to persist (expected to be a PDF from the UI).
 *
 * Returns: Promise<string>
 * - Resolves with the generated key on success.
 * - Rejects with the underlying IndexedDB error on failure.
 */
export async function savePendingPdf(file: File): Promise<string> {
  const db = await openDB();
  const tx = db.transaction("pending", "readwrite");
  const store = tx.objectStore("pending");
  const key = `rico-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const record: PendingRecord = {
    key,
    filename: file.name,
    blob: file,
    createdAt: Date.now(),
  };
  return await new Promise<string>((resolve, reject) => {
    const req = store.put(record, key as IDBValidKey);
    req.onsuccess = () => {
      resolve(key);
    };
    req.onerror = () => reject(req.error);
  });
}

export async function loadPendingPdf(
  key: string,
): Promise<{ arrayBuffer: ArrayBuffer; filename?: string } | null> {
  const db = await openDB();
  const tx = db.transaction("pending", "readonly");
  const store = tx.objectStore("pending");
  return await new Promise((resolve, reject) => {
    const req = store.get(key as IDBValidKey);
    req.onsuccess = async () => {
      const rec = req.result as PendingRecord | undefined;
      if (!rec) return resolve(null);
      try {
        const arrayBuffer = await (rec.blob as Blob).arrayBuffer();
        resolve({ arrayBuffer, filename: rec.filename });
      } catch (e) {
        reject(e);
      }
    };
    req.onerror = () => reject(req.error);
  });
}

export async function deletePendingPdf(key: string): Promise<void> {
  const db = await openDB();
  const tx = db.transaction("pending", "readwrite");
  const store = tx.objectStore("pending");
  return await new Promise((resolve, reject) => {
    const req = store.delete(key as IDBValidKey);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

// Optional: implement simple cleanup of old records
export async function cleanupOldPendingPdfs(maxAgeMs = 1000 * 60 * 60 * 24) {
  try {
    const db = await openDB();
    const tx = db.transaction("pending", "readwrite");
    const store = tx.objectStore("pending");
    const req = store.openCursor();
    req.onsuccess = () => {
      const cur = req.result as IDBCursorWithValue | null;
      if (!cur) return;
      const rec = cur.value as PendingRecord;
      if (Date.now() - rec.createdAt > maxAgeMs) {
        cur.delete();
      }
      cur.continue();
    };
  } catch (e) {
    // swallow errors — best-effort cleanup
    console.warn("cleanupOldPendingPdfs failed", e);
  }
}

const pendingPdfStore = {
  savePendingPdf,
  loadPendingPdf,
  deletePendingPdf,
  cleanupOldPendingPdfs,
};

export default pendingPdfStore;
