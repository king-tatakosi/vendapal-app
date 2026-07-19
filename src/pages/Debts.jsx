import { useState, useMemo } from 'react';
import { DebtCard } from '../components/DebtCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { DebtForm } from '../components/DebtForm';
import { formatCurrency } from '../utils/format';
import { useToast } from '../context/ToastContext';

export function Debts({ debts, supplierDebts }) {
  const showToast = useToast();
  const [tab, setTab] = useState('owe-me');
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [showPaid, setShowPaid] = useState(true);
  const [prefill, setPrefill] = useState(null);
  const [editingDebt, setEditingDebt] = useState(null);
  const [undoQueue, setUndoQueue] = useState([]);

  const isOweMe = tab === 'owe-me';
  const source = isOweMe ? debts : supplierDebts;
  const allRecords = source.supplierDebts ?? source.debts;
  const total = source.totalOwed ?? source.totalIOwe;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const nameKey = isOweMe ? 'name' : 'supplierName';
    const list = (allRecords || []).filter(r => !undoQueue.some(u => u.id === r.id));
    const unpaid = list.filter(d => !d.paid);
    const shown = showPaid ? list : unpaid;
    if (!q) return shown;
    return shown.filter(d => (d[nameKey] || d.name || '').toLowerCase().includes(q));
  }, [allRecords, search, showPaid, isOweMe, undoQueue]);

  const handleAdd = async data => {
    const payload = isOweMe ? data : { ...data, supplierName: data.name };
    if (isOweMe) await debts.addDebt(payload);
    else await supplierDebts.addSupplierDebt(payload);
    setShowAdd(false);
    setPrefill(null);
    showToast('Record saved ✓');
  };

  const handleNewDebt = debt => {
    setPrefill({ name: debt.name, phone: debt.phone, });
    setShowAdd(true);
  };

  const handleEdit = debt => setEditingDebt(debt);

  const handleUpdate = async data => {
    const payload = isOweMe ? data : { ...data, supplierName: data.name };
    if (isOweMe) await debts.updateDebt(editingDebt.id, payload);
    else await supplierDebts.updateSupplierDebt(editingDebt.id, payload);
    setEditingDebt(null);
    showToast('Record updated ✓');
  };

  const handleDelete = id => {
    const doDelete = isOweMe ? debts.deleteDebt : supplierDebts.deleteSupplierDebt;
    const timeoutId = setTimeout(async () => {
      await doDelete(id);
      setUndoQueue(q => q.filter(u => u.id !== id));
    }, 5000);
    setUndoQueue(q => [...q, { id, timeoutId }]);
    showToast('Record deleted', {
      label: 'Undo',
      onClick: () => {
        clearTimeout(timeoutId);
        setUndoQueue(q => q.filter(u => u.id !== id));
      },
    });
  };

  const handleRecordPayment = async (id, amount, note) => {
    const fn = isOweMe ? debts.recordPayment : supplierDebts.recordPayment;
    await fn(id, amount, note);
    showToast('Payment recorded ✓');
  };

  const handleMarkPaid = async id => {
    const fn = isOweMe ? debts.markAsPaid : supplierDebts.markAsPaid;
    await fn(id);
    showToast('Marked as paid ✓');
  };

  const patchName = record => isOweMe ? record : { ...record, name: record.supplierName || record.name };

  const noResultsFromSearch = search.trim() && filtered.length === 0;
  const showSearch = (allRecords || []).length > 5;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">Debts</h1>
      </div>

      <div className="sub-tabs">
        <button
          className={`sub-tab${isOweMe ? ' sub-tab--active' : ''}`}
          onClick={() => { setTab('owe-me'); setSearch(''); }}
        >
          Customers
          {debts.unpaid?.length > 0 && (
            <span className="sub-tab-badge">{debts.unpaid.length}</span>
          )}
        </button>
        <button
          className={`sub-tab${!isOweMe ? ' sub-tab--active' : ''}`}
          onClick={() => { setTab('i-owe'); setSearch(''); }}
        >
          Suppliers
          {supplierDebts.unpaid?.length > 0 && (
            <span className="sub-tab-badge sub-tab-badge--orange">{supplierDebts.unpaid.length}</span>
          )}
        </button>
      </div>

      {total > 0 && (
        <div className={`total-banner${!isOweMe ? ' total-banner--orange' : ''}`}>
          <span>{isOweMe ? 'Total owed to you' : 'Total you owe'}</span>
          <strong>{formatCurrency(total)}</strong>
        </div>
      )}

      <div className="page-body">
        {showSearch && (
          <SearchBar
            value={search}
            onChange={setSearch}
            placeholder={isOweMe ? 'Search customers…' : 'Search suppliers…'}
          />
        )}

        {(allRecords || []).some(d => d.paid) && (
          <button className="toggle-paid" onClick={() => setShowPaid(x => !x)}>
            {showPaid ? '👁 Hide paid records' : '👁 Show paid records'}
          </button>
        )}

        <div className="card-list">
          {filtered.map(d => (
            <DebtCard
              key={d.id}
              debt={patchName(d)}
              onRecordPayment={handleRecordPayment}
              onMarkPaid={handleMarkPaid}
              onDelete={handleDelete}
              onNewDebt={handleNewDebt}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {noResultsFromSearch && (
          <EmptyState
            icon="🔍"
            title="No customer found"
            subtitle={`No match for "${search}"`}
            action="+ Add New Customer"
            onAction={() => { setSearch(''); setShowAdd(true); }}
          />
        )}

        {!search && (allRecords || []).filter(d => !d.paid).length === 0 && (
          <EmptyState
            icon={isOweMe ? '🤝' : '📋'}
            title={isOweMe ? 'No debt records yet' : 'Nothing recorded yet'}
            subtitle={isOweMe ? 'Add the first person who owes you money' : 'Add a supplier you owe money to'}
          />
        )}
      </div>

      <button className="fab fab--extended" onClick={() => setShowAdd(true)} aria-label="Add new record">
        <span className="fab__icon">+</span>
        <span className="fab__label">{isOweMe ? 'Add Debt' : 'Add What I Owe'}</span>
      </button>

      {showAdd && (
        <Modal
          title={isOweMe ? 'New Debt Record' : 'Add What I Owe'}
          onClose={() => { setShowAdd(false); setPrefill(null); }}
        >
          <DebtForm
            mode={tab}
            onSubmit={handleAdd}
            onCancel={() => { setShowAdd(false); setPrefill(null); }}
            initialValues={prefill}
          />
        </Modal>
      )}

      {editingDebt && (
        <Modal title="Edit Record" onClose={() => setEditingDebt(null)}>
          <DebtForm
            key={editingDebt.id}
            mode={tab}
            onSubmit={handleUpdate}
            onCancel={() => setEditingDebt(null)}
            initialValues={{
              id: editingDebt.id,
              name: editingDebt.name,
              phone: editingDebt.phone,
              amount: editingDebt.amount,
              note: editingDebt.note,
              dueDate: editingDebt.dueDate
            }}
          />
        </Modal>
      )}
    </div>
  );
}
