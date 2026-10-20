import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useDebts() {
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await db.getAll('debts');
      setDebts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addDebt = async data => {
    const debt = {
      ...data,
      id: Date.now().toString(),
      paid: false,
      paidAmount: 0,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('debts', debt);
    setDebts(prev => [debt, ...prev]);
    return debt;
  };

  const recordPayment = async (id, amount, note = '') => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const payment = { amount: +amount, note, date: new Date().toISOString() };
    const paidAmount = (debt.paidAmount || 0) + +amount;
    const updated = {
      ...debt,
      paidAmount,
      paid: paidAmount >= debt.amount,
      payments: [...(debt.payments || []), payment],
      updatedAt: new Date().toISOString(),
    };
    await db.put('debts', updated);
    setDebts(prev => prev.map(d => d.id === id ? updated : d));
  };

  const markAsPaid = async id => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const updated = { ...debt, paid: true, paidAmount: debt.amount, updatedAt: new Date().toISOString() };
    await db.put('debts', updated);
    setDebts(prev => prev.map(d => d.id === id ? updated : d));
  };

  const updateDebt = async (id, data) => {
    const debt = debts.find(d => d.id === id);
    if (!debt) return;
    const updated = { ...debt, ...data, updatedAt: new Date().toISOString() };
    await db.put('debts', updated);
    setDebts(prev => prev.map(d => d.id === id ? updated : d));
  };

  const deleteDebt = async id => {
    await db.remove('debts', id);
    setDebts(prev => prev.filter(d => d.id !== id));
  };

  const unpaid = debts.filter(d => !d.paid);
  const totalOwed = unpaid.reduce((s, d) => s + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  return { debts, unpaid, totalOwed, loading, reload: load, addDebt, updateDebt, recordPayment, markAsPaid, deleteDebt };
}
