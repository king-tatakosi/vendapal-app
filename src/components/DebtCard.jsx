import { useState } from 'react';
import { formatCurrency, formatDate, initials } from '../utils/format';
import { Modal } from './Modal';

function PaymentModal({ debt, onClose, onSubmit }) {
  const remaining = debt.amount - (debt.paidAmount || 0);
  const [amount, setAmount] = useState('');
  const [err, setErr] = useState('');

  const handleSubmit = e => {
    e.preventDefault();
    const val = parseFloat(amount);
    if (!val || val <= 0) { setErr('Enter a valid amount'); return; }
    if (val > remaining) { setErr(`Amount cannot exceed ${formatCurrency(remaining)}`); return; }
    onSubmit(val);
  };

  return (
    <Modal title="Record Payment" onClose={onClose}>
      <p className="modal-hint">
        Remaining: <strong>{formatCurrency(remaining)}</strong>
      </p>
      <form onSubmit={handleSubmit} className="form">
        <div className="form-field">
          <label className="form-label">Amount paid</label>
          <input
            className="form-input"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={amount}
            onChange={e => { setAmount(e.target.value); setErr(''); }}
            min="0.01"
            step="0.01"
            autoFocus
          />
          {err && <span className="form-error">{err}</span>}
        </div>
       
        
        <button className="btn btn--primary btn--full" type="submit">Save Payment</button>
      </form>
    </Modal>
  );
}

export function DebtCard({ debt, onRecordPayment, onMarkPaid, onDelete, onNewDebt, onEdit }) {
  const [expanded, setExpanded] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const remaining = Math.max(0, debt.amount - (debt.paidAmount || 0));
  const progress = debt.amount > 0 ? Math.min((debt.paidAmount || 0) / debt.amount, 1) : 0;

  const handlePayment = (amount, note) => {
    onRecordPayment(debt.id, amount, note);
    setShowPayment(false);
  };

  return (
    <>
      <div className={`debt-card${debt.paid ? ' debt-card--paid' : ''}`}>
        <div className="debt-card__row" onClick={() => setExpanded(x => !x)}>
          <div className="avatar">{initials(debt.name)}</div>
          <div className="debt-card__info">
            <p className="debt-card__name">{debt.name}</p>
            <p className="debt-card__meta">{formatDate(debt.createdAt)}</p>
          </div>
          <div className="debt-card__right">
            {debt.paid ? (
              <span className="badge badge--success">Paid ✓</span>
            ) : (
              <span className="debt-card__amount">{formatCurrency(remaining)}</span>
            )}
            <span className={`chevron${expanded ? ' chevron--up' : ''}`}>›</span>
          </div>
        </div>

        {!debt.paid && debt.paidAmount > 0 && (
          <div className="progress-wrap">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${progress * 100}%` }} />
            </div>
            <p className="progress-text">Paid {formatCurrency(debt.paidAmount || 0)} of {formatCurrency(debt.amount)}</p>
          </div>
        )}

        {expanded && (
          <div className="debt-card__body">
            <div className="debt-card__detail-row">
              <span className="detail-label">Total debt</span>
              <span className="detail-value">{formatCurrency(debt.amount)}</span>
            </div>
            {!debt.paid && (
              <div className="debt-card__detail-row">
                <span className="detail-label">Still owes</span>
                <span className="detail-value text-danger">{formatCurrency(remaining)}</span>
              </div>
            )}
            {debt.note && (
              <div className="note-box">
                <span>📝</span> {debt.note}
              </div>
            )}

            {debt.payments?.length > 0 && (
              <div className="payment-history">
                <p className="section-label">Payment History</p>
                {debt.payments.map((p, i) => (
                  <div key={i} className="payment-item">
                    <span>{formatDate(p.date)}{p.note ? ` · ${p.note}` : ''}</span>
                    <span className="text-success">+{formatCurrency(p.amount)}</span>
                  </div>
                ))}
              </div>
            )}

            {debt.paid ? (
              <button className="btn btn--soft btn--full" onClick={() => onNewDebt?.(debt)}>
                + Record New Debt for {debt.name.split(' ')[0]}
              </button>
            ) : (
              <div className="debt-card__actions">
                <button className="btn btn--primary" onClick={() => setShowPayment(true)}>
                   Record Payment
                </button>
                <button className="btn btn--success" onClick={() => onMarkPaid(debt.id)}>
                  ✓ Mark as Paid
                </button>
              </div>
            )}

            {debt.phone && (
              <a className="btn btn--outline btn--full" href={`tel:${debt.phone}`}>
                📞 Call {debt.name.split(' ')[0]}
              </a>
            )}

            <div className="debt-card__actions">
              {onEdit && (
                <button className="btn btn--ghost btn--sm" onClick={() => onEdit(debt)}>
                  ✏️ Edit
                </button>
              )}
              <button className="btn btn--ghost btn--sm text-danger" onClick={() => onDelete?.(debt.id)}>
                🗑 Delete
              </button>
            </div>
          </div>
        )}
      </div>

      {showPayment && (
        <PaymentModal debt={debt} onClose={() => setShowPayment(false)} onSubmit={handlePayment} />
      )}
    </>
  );
}
