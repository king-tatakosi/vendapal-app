import { useState, useCallback, useRef } from 'react';
import { ToastCtx } from './toastCtx';

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);
  const timerRef = useRef(null);

  const showToast = useCallback((message, action = null) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast({ message, action });
    timerRef.current = setTimeout(() => setToast(null), action ? 5000 : 3000);
  }, []);

  const dismiss = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setToast(null);
  };

  return (
    <ToastCtx.Provider value={showToast}>
      {children}
      {toast && (
        <div className="toast">
          <span className="toast__msg">{toast.message}</span>
          {toast.action && (
            <button className="toast__action" onClick={() => { toast.action.onClick(); dismiss(); }}>
              {toast.action.label}
            </button>
          )}
        </div>
      )}
    </ToastCtx.Provider>
  );
}
