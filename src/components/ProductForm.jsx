import { useState } from 'react';

export function ProductForm({ onSubmit, onCancel, initialValues = null }) {
  const isEdit = initialValues != null;
  const [form, setForm] = useState({
    name:       initialValues?.name ?? '',
    quantity:   initialValues?.quantity != null ? String(initialValues.quantity) : '',
    unit:       initialValues?.unit ?? 'packs',
    minStock:   initialValues?.minStock != null ? String(initialValues.minStock) : '',
    expiryDate: initialValues?.expiryDate ?? '',
    price:      initialValues?.price != null ? String(initialValues.price) : '',
    costPrice:  initialValues?.costPrice != null ? String(initialValues.costPrice) : '',
  });
  const [errors, setErrors] = useState({}); 
  const [saving, setSaving] = useState(false);

  const set = (key, val) => {
    setForm(f => ({ ...f, [key]: val }));
    setErrors(e => ({ ...e, [key]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.name.trim()) errs.name = 'Enter a product name';
    if (form.quantity === '' || isNaN(+form.quantity) || +form.quantity < 0) errs.quantity = 'Enter a valid quantity';
    return errs;
  };

  const handleSubmit = async e => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setSaving(true);
    try {
      await onSubmit({
        name: form.name.trim(),
        quantity: parseInt(form.quantity),
        unit: form.unit.trim() || 'pieces',
        minStock: form.minStock !== '' ? parseInt(form.minStock) : undefined,
        expiryDate: form.expiryDate || null,
        price: form.price !== '' ? parseFloat(form.price) : undefined,
        costPrice: form.costPrice !== '' ? parseFloat(form.costPrice) : undefined,
      });
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <form onSubmit={handleSubmit} className="form">
      <div className="form-field">
        <label className="form-label">Product name <span className="required">*</span></label>
        <input
          className={`form-input${errors.name ? ' form-input--error' : ''}`}
          type="text"
          placeholder="e.g. Rice 50kg, Cooking Oil"
          value={form.name}
          onChange={e => set('name', e.target.value)}
          autoFocus
        />
        {errors.name && <span className="form-error">{errors.name}</span>}
      </div>

      <div className="form-row">
        <div className="form-field form-field--flex">
          <label className="form-label">Quantity <span className="required">*</span></label>
          <input
            className={`form-input${errors.quantity ? ' form-input--error' : ''}`}
            type="number"
            inputMode="numeric"
            placeholder="0"
            value={form.quantity}
            onChange={e => set('quantity', e.target.value)}
            min="0"
          />
          {errors.quantity && <span className="form-error">{errors.quantity}</span>}
        </div>
        <div className="form-field form-field--flex">
          <label className="form-label">Unit</label>
          <input
            className="form-input"
            type="text"
            placeholder="e.g. bags, bottles"
            value={form.unit}
            onChange={e => set('unit', e.target.value)}
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">
          Alert when stock is below <span className="optional">(optional)</span>
        </label>
        <input
          className="form-input"
          type="number"
          inputMode="numeric"
          placeholder="e.g. 5"
          value={form.minStock}
          onChange={e => set('minStock', e.target.value)}
          min="0"
        />
      </div>

      <div className="form-field">
        <label className="form-label">
          Expiry date <span className="optional">(optional)</span>
        </label>
        <input
          className="form-input"
          type="date"
          value={form.expiryDate}
          onChange={e => set('expiryDate', e.target.value)}
          min={today}
        />
      </div>

      <div className="form-field">
        <label className="form-label">
          Selling price <span className="optional">(optional)</span>
        </label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">GH₵</span>
          <input
            className="form-input form-input--prefixed"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={form.price}
            onChange={e => set('price', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-field">
        <label className="form-label">
          Cost price <span className="optional">(optional)</span>
        </label>
        <div className="input-prefix-wrap">
          <span className="input-prefix">GH₵</span>
          <input
            className="form-input form-input--prefixed"
            type="number"
            inputMode="decimal"
            placeholder="0.00"
            value={form.costPrice}
            onChange={e => set('costPrice', e.target.value)}
            min="0"
            step="0.01"
          />
        </div>
      </div>

      <div className="form-actions">
        <button className="btn btn--primary btn--full" type="submit" disabled={saving}>
          {saving ? 'Saving…' : isEdit ? '✓ Save Changes' : '✓ Add Product'}
        </button>
        <button className="btn btn--ghost btn--full" type="button" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
