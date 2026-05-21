import { useState, useMemo } from 'react';
import { ProductCard } from '../components/ProductCard';
import { SearchBar } from '../components/SearchBar';
import { EmptyState } from '../components/EmptyState';
import { Modal } from '../components/Modal';
import { ProductForm } from '../components/ProductForm';
import { useToast } from '../context/ToastContext';

export function Products({ products, addProduct, updateProduct, deleteProduct }) {
  const showToast = useToast();
  const [search, setSearch] = useState('');
  const [showAdd, setShowAdd] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [undoQueue, setUndoQueue] = useState([]);

  const visible = products.filter(p => !undoQueue.some(u => u.id === p.id));

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return visible;
    return visible.filter(p => p.name.toLowerCase().includes(q));
  }, [visible, search]);

  const handleAdd = async data => {
    await addProduct(data);
    setShowAdd(false);
    showToast('Product added ✓');
  };

  const handleEdit = product => setEditingProduct(product);

  const handleUpdate = async data => {
    await updateProduct(editingProduct.id, data);
    setEditingProduct(null);
    showToast('Product updated ✓');
  };

  const handleDelete = id => {
    const timeoutId = setTimeout(async () => {
      await deleteProduct(id);
      setUndoQueue(q => q.filter(u => u.id !== id));
    }, 5000);
    setUndoQueue(q => [...q, { id, timeoutId }]);
    showToast('Product deleted', {
      label: 'Undo',
      onClick: () => {
        clearTimeout(timeoutId);
        setUndoQueue(q => q.filter(u => u.id !== id));
      },
    });
  };

  const handleStockUpdate = async (id, updates) => {
    await updateProduct(id, updates);
    showToast('Stock updated ✓');
  };

  const noResult = search.trim() && filtered.length === 0;

  return (
    <div className="page">
      <div className="page-header">
        <h1 className="page-title">My Products</h1>
        <span className="page-count">{products.length} item{products.length !== 1 ? 's' : ''}</span>
      </div>

      <div className="page-body">
        {products.length > 7 && (
          <SearchBar value={search} onChange={setSearch} placeholder="Search products…" />
        )}

        <div className="card-list">
          {filtered.map(p => (
            <ProductCard
              key={p.id}
              product={p}
              onUpdate={handleStockUpdate}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>

        {noResult && (
          <EmptyState
            icon="🔍"
            title="Product not found"
            subtitle={`No match for "${search}"`}
            action="+ Add Product"
            onAction={() => { setSearch(''); setShowAdd(true); }}
          />
        )}

        {products.length === 0 && (
          <EmptyState
            icon="📦"
            title="No products yet"
            subtitle="Add the items you sell or stock so you can track them and get expiry alerts two months 
            before product expires"
            action="+ Add First Product"
            onAction={() => setShowAdd(true)}
          />
        )}
      </div>

      <button className="fab" onClick={() => setShowAdd(true)} aria-label="Add product">+</button>

      {showAdd && (
        <Modal title="Add New Product" onClose={() => setShowAdd(false)}>
          <ProductForm onSubmit={handleAdd} onCancel={() => setShowAdd(false)} />
        </Modal>
      )}

      {editingProduct && (
        <Modal title="Edit Product" onClose={() => setEditingProduct(null)}>
          <ProductForm
            onSubmit={handleUpdate}
            onCancel={() => setEditingProduct(null)}
            initialValues={editingProduct}
          />
        </Modal>
      )}
    </div>
  );
}
