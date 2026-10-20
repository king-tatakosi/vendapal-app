import { db, STORES } from '../db/db';

const APP_ID = 'vendapal';
const BACKUP_VERSION = 1;

// Errors with a message that is safe and useful to show the user.
export class BackupError extends Error {}

function backupFilename() {
  return `vendapal-backup-${new Date().toISOString().slice(0, 10)}.json`;
}

function countRecords(data) {
  return STORES.reduce((sum, store) => sum + (data[store]?.length ?? 0), 0);
}

function downloadFile(file) {
  const url = URL.createObjectURL(file);
  const a = document.createElement('a');
  a.href = url;
  a.download = file.name;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Exports all VendaPal data as a single JSON file and downloads it.
 *
 * Resolves to { method: 'download' | 'empty', total }.
 */
export async function exportBackup() {
  const data = await db.exportAll();
  const total = countRecords(data);
  if (total === 0) return { method: 'empty', total };

  const backup = {
    app: APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    data,
  };
  const file = new File([JSON.stringify(backup, null, 2)], backupFilename(), {
    type: 'application/json',
  });

  downloadFile(file);
  return { method: 'download', total };
}

/**
 * Parses and validates the text of a backup file.
 * Returns { debts, products, supplier_debts } or throws a BackupError.
 */
export function parseBackup(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    throw new BackupError('That file is not a VendaPal backup.');
  }

  if (parsed?.app !== APP_ID || typeof parsed.data !== 'object' || parsed.data === null) {
    throw new BackupError('That file is not a VendaPal backup.');
  }
  if (typeof parsed.version === 'number' && parsed.version > BACKUP_VERSION) {
    throw new BackupError('This backup is from a newer VendaPal. Please update the app first.');
  }

  const data = {};
  for (const store of STORES) {
    const records = parsed.data[store] ?? [];
    const valid =
      Array.isArray(records) &&
      records.every(
        r => r && typeof r === 'object' && (typeof r.id === 'string' || typeof r.id === 'number')
      );
    if (!valid) throw new BackupError('The backup file looks damaged, so nothing was imported.');
    data[store] = records;
  }
  return data;
}

/**
 * Imports a backup file chosen by the user. Merges by id; never deletes.
 * Resolves to the total number of records imported.
 */
export async function importBackup(file) {
  const data = parseBackup(await file.text());
  const counts = await db.importAll(data);
  return STORES.reduce((sum, store) => sum + counts[store], 0);
}
