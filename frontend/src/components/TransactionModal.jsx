import { useState } from 'react';
import { X } from 'lucide-react';
import { format } from 'date-fns';
import { api } from '../utils/api';
import './Modal.css';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Salary', 'Freelance', 'Other'];

const today = () => format(new Date(), 'yyyy-MM-dd');

const EMPTY_FORM = {
  date: today(),
  description: '',
  amount: '',
  category: '',
  type: 'expense',
};

export default function TransactionModal({ onClose, onSuccess }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [serverError, setServerError] = useState(null);

  function validate() {
    const e = {};
    if (!form.date || !/^\d{4}-\d{2}-\d{2}$/.test(form.date)) e.date = 'Valid date required (YYYY-MM-DD)';
    if (!form.description.trim()) e.description = 'Description is required';
    const amt = parseFloat(form.amount);
    if (isNaN(amt) || amt <= 0) e.amount = 'Amount must be greater than 0';
    if (!form.category) e.category = 'Category is required';
    if (!['income', 'expense'].includes(form.type)) e.type = 'Type is required';
    return e;
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrors((err) => ({ ...err, [name]: undefined }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    setSubmitting(true);
    setServerError(null);
    try {
      await api.post('/transactions', {
        date: form.date,
        description: form.description.trim(),
        amount: parseFloat(form.amount),
        category: form.category,
        type: form.type,
      });
      onSuccess();
    } catch (err) {
      setServerError(err.data?.errors?.join(', ') || err.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Add Transaction</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate>
          <div className="modal-body">
            {serverError && <div className="form-server-error">{serverError}</div>}

            <div className="form-field">
              <label className="form-label" htmlFor="txn-date">Date</label>
              <input
                id="txn-date"
                type="date"
                name="date"
                className={`form-input ${errors.date ? 'form-input--error' : ''}`}
                value={form.date}
                onChange={handleChange}
              />
              {errors.date && <span className="form-error">{errors.date}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="txn-desc">Description</label>
              <input
                id="txn-desc"
                type="text"
                name="description"
                className={`form-input ${errors.description ? 'form-input--error' : ''}`}
                value={form.description}
                onChange={handleChange}
                placeholder="e.g. Grocery shopping"
                maxLength={120}
              />
              {errors.description && <span className="form-error">{errors.description}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="txn-amount">Amount ($)</label>
              <input
                id="txn-amount"
                type="number"
                name="amount"
                className={`form-input ${errors.amount ? 'form-input--error' : ''}`}
                value={form.amount}
                onChange={handleChange}
                placeholder="0.00"
                min="0.01"
                step="0.01"
              />
              {errors.amount && <span className="form-error">{errors.amount}</span>}
            </div>

            <div className="form-field">
              <label className="form-label" htmlFor="txn-category">Category</label>
              <select
                id="txn-category"
                name="category"
                className={`form-input ${errors.category ? 'form-input--error' : ''}`}
                value={form.category}
                onChange={handleChange}
              >
                <option value="">Select category…</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              {errors.category && <span className="form-error">{errors.category}</span>}
            </div>

            <div className="form-field">
              <span className="form-label">Type</span>
              <div className="form-radio-group">
                {['income', 'expense'].map((t) => (
                  <label key={t} className="form-radio-label">
                    <input
                      type="radio"
                      name="type"
                      value={t}
                      checked={form.type === t}
                      onChange={handleChange}
                    />
                    <span>{t.charAt(0).toUpperCase() + t.slice(1)}</span>
                  </label>
                ))}
              </div>
              {errors.type && <span className="form-error">{errors.type}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn--ghost" onClick={onClose} disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn--primary" disabled={submitting}>
              {submitting ? 'Saving…' : 'Add Transaction'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
