import { useRef, useState } from 'react';
import { useToast } from '../context/toastCtx';
import { exportBackup, importBackup, BackupError } from '../utils/backup';

export function BackupSection({ onImported }) {
  const showToast = useToast();
  const fileRef = useRef(null);
  const [busy, setBusy] = useState(null); // 'export' | 'import' | null

  const handleExport = async () => {
    setBusy('export');
    try {
      const { method } = await exportBackup();
      if (method === 'empty') showToast('Nothing to export yet. Add a debt or product first.');
      else if (method === 'download') showToast('Backup saved to your Downloads folder');
    } catch {
      showToast('Could not export your data. Please try again.');
    } finally {
      setBusy(null);
    }
  };

  const handleFile = async e => {
    const file = e.target.files?.[0];
    e.target.value = ''; // lets the same file be picked again later
    if (!file) return;

    setBusy('import');
    try {
      const total = await importBackup(file);
      await onImported?.();
      showToast(
        total === 0
          ? 'That backup was empty, so nothing was imported.'
          : `Imported ${total} record${total === 1 ? '' : 's'} from your backup`
      );
    } catch (err) {
      showToast(
        err instanceof BackupError ? err.message : 'Could not import that file. Please try again.'
      );
    } finally {
      setBusy(null);
    }
  };

  return (
    <div className="section section--backup">
      <div className="backup-card">
        <h2 className="backup-card__title">Move to a new phone</h2>
        <p className="backup-card__hint">
          Export your data, send the file to your new phone, then tap Import there.
        </p>
        <div className="backup-card__actions">
          <button className="btn btn--outline" onClick={handleExport} disabled={busy !== null}>
            {busy === 'export' ? 'Exporting…' : '📤 Export'}
          </button>
          <button
            className="btn btn--outline"
            onClick={() => fileRef.current?.click()}
            disabled={busy !== null}
          >
            {busy === 'import' ? 'Importing…' : '📥 Import'}
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json,text/plain,application/octet-stream"
          onChange={handleFile}
          hidden
        />
      </div>
    </div>
  );
}
