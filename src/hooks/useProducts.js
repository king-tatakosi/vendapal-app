import { useState, useEffect, useCallback } from 'react';
import { db } from '../db/db';

export function useProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const data = await db.getAll('products');
      setProducts(data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const addProduct = async data => {
    const product = {
      ...data,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    await db.put('products', product);
    setProducts(prev => [product, ...prev]);
    return product;
  };

  const updateProduct = async (id, updates) => {
    const p = products.find(x => x.id === id);
    if (!p) return;
    const updated = { ...p, ...updates, updatedAt: new Date().toISOString() };
    await db.put('products', updated);
    setProducts(prev => prev.map(x => x.id === id ? updated : x));
  };

  const deleteProduct = async id => {
    await db.remove('products', id);
    setProducts(prev => prev.filter(x => x.id !== id));
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const soonLimit = new Date(today);
  soonLimit.setDate(soonLimit.getDate() + 60);

  const lowStock = products.filter(p =>
    p.quantity !== undefined && p.minStock !== undefined && +p.quantity <= +p.minStock
  );
  const expiringSoon = products.filter(p => {
    if (!p.expiryDate) return false;
    const exp = new Date(p.expiryDate);
    return exp >= today && exp <= soonLimit;
  });
  const expired = products.filter(p => {
    if (!p.expiryDate) return false;
    return new Date(p.expiryDate) < today;
  });

  return { products, loading, reload: load, addProduct, updateProduct, deleteProduct, lowStock, expiringSoon, expired };
}
