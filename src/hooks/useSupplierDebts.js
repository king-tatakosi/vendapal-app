import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useSupplierDebts() {
  const [supplierDebts, setSupplierDebts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await db.getAll('supplier_debts');
      setSupplierDebts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addSupplierDebt = async data => {
    const debt = {
      ...data,
      id: Date.now().toString(),
      paid: false,
      paidAmount: 0,
      payments: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('supplier_debts', debt);
    setSupplierDebts(prev => [debt, ...prev]);
    return debt;
  };

  const recordPayment = async (id, amount, note = '') => {
    const debt = supplierDebts.find(d => d.id === id);
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
    await db.put('supplier_debts', updated);
    setSupplierDebts(prev => prev.map(d => d.id === id ? updated : d));
  };

  const markAsPaid = async id => {
    const debt = supplierDebts.find(d => d.id === id);
    if (!debt) return;
    const updated = { ...debt, paid: true, paidAmount: debt.amount, updatedAt: new Date().toISOString() };
    await db.put('supplier_debts', updated);
    setSupplierDebts(prev => prev.map(d => d.id === id ? updated : d));
  };

  const updateSupplierDebt = async (id, data) => {
    const debt = supplierDebts.find(d => d.id === id);
    if (!debt) return;
    const updated = { ...debt, ...data, updatedAt: new Date().toISOString() };
    await db.put('supplier_debts', updated);
    setSupplierDebts(prev => prev.map(d => d.id === id ? updated : d));
  };

  const deleteSupplierDebt = async id => {
    await db.remove('supplier_debts', id);
    setSupplierDebts(prev => prev.filter(d => d.id !== id));
  };

  const unpaid = supplierDebts.filter(d => !d.paid);
  const totalIOwe = unpaid.reduce((s, d) => s + Math.max(0, d.amount - (d.paidAmount || 0)), 0);

  return { supplierDebts, unpaid, totalIOwe, loading, reload: load, addSupplierDebt, updateSupplierDebt, recordPayment, markAsPaid, deleteSupplierDebt };
}
