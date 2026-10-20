const DB_NAME = 'vendapal_db';
const DB_VERSION = 1;
export const STORES = ['debts', 'products', 'supplier_debts'];

function openDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onerror = () => reject(req.error);
    req.onsuccess = () => resolve(req.result);
    req.onupgradeneeded = e => {
      const db = e.target.result;
      STORES.forEach(name => {
        if (!db.objectStoreNames.contains(name)) {
          db.createObjectStore(name, { keyPath: 'id' });
        }
      });
    };
  });
}

async function getAll(store) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly');
    const req = tx.objectStore(store).getAll();
    req.onsuccess = () => resolve(req.result ?? []);
    req.onerror = () => reject(req.error);
  });
}

async function put(store, item) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).put(item);
    req.onsuccess = () => resolve(item);
    req.onerror = () => reject(req.error);
  });
}

async function remove(store, id) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite');
    const req = tx.objectStore(store).delete(id);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function exportAll() {
  const result = {};
  for (const store of STORES) {
    result[store] = await getAll(store);
  }
  return result;
}

// Writes every record in one transaction, so a failure part-way through
// leaves the existing data untouched. Records are merged by id: existing
// records with the same id are overwritten, nothing else is deleted.
async function importAll(data) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORES, 'readwrite');
    const counts = {};
    STORES.forEach(store => {
      const records = data[store] ?? [];
      counts[store] = records.length;
      const objectStore = tx.objectStore(store);
      records.forEach(record => objectStore.put(record));
    });
    tx.oncomplete = () => resolve(counts);
    tx.onerror = () => reject(tx.error);
    tx.onabort = () => reject(tx.error);
  });
}

export const db = { getAll, put, remove, exportAll, importAll };
