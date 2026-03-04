import { useState, useEffect, useCallback } from 'react';
import { Plus, Download, Trash2, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { api } from '../utils/api';
import { exportTransactionsCSV } from '../utils/csvExport';
import TransactionModal from '../components/TransactionModal';
import ConfirmDialog from '../components/ConfirmDialog';
import './Transactions.css';

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Salary', 'Freelance', 'Other'];
const PAGE_SIZE = 20;

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatDate(dateStr) {
  try { return format(parseISO(dateStr), 'MMM d, yyyy'); } catch { return dateStr; }
}

function SortIcon({ field, sortField, sortDir }) {
  if (sortField !== field) return <ChevronsUpDown size={14} className="sort-icon sort-icon--inactive" />;
  return sortDir === 'asc'
    ? <ChevronUp size={14} className="sort-icon sort-icon--active" />
    : <ChevronDown size={14} className="sort-icon sort-icon--active" />;
}

export default function Transactions() {
  const [transactions, setTransactions] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filterCategory, setFilterCategory] = useState('');
  const [filterType, setFilterType] = useState('');

  // Sort (client-side on current page)
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  // Modal state
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null); // { id, description }
  const [deleting, setDeleting] = useState(false);

  // CSV export state
  const [exporting, setExporting] = useState(false);

  const fetchTransactions = useCallback(() => {
    setLoading(true);
    setError(null);

    const params = new URLSearchParams({ page, limit: PAGE_SIZE });
    if (filterCategory) params.set('category', filterCategory);
    if (filterType) params.set('type', filterType);

    api.get(`/transactions?${params}`)
      .then((data) => {
        setTransactions(data.data);
        setTotal(data.total);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load transactions');
        setLoading(false);
      });
  }, [page, filterCategory, filterType]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  // Reset to page 1 when filters change
  useEffect(() => {
    setPage(1);
  }, [filterCategory, filterType]);

  function handleSort(field) {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  }

  const sortedRows = [...transactions].sort((a, b) => {
    let av = a[sortField];
    let bv = b[sortField];
    if (sortField === 'date') { av = new Date(av); bv = new Date(bv); }
    if (av < bv) return sortDir === 'asc' ? -1 : 1;
    if (av > bv) return sortDir === 'asc' ? 1 : -1;
    return 0;
  });

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.delete(`/transactions/${deleteTarget.id}`);
      setDeleteTarget(null);
      fetchTransactions();
    } catch (err) {
      setDeleteTarget(null);
      setError(err.message || 'Delete failed');
    } finally {
      setDeleting(false);
    }
  }

  async function handleExportCSV() {
    setExporting(true);
    try {
      const params = new URLSearchParams({ page: 1, limit: 10000 });
      const data = await api.get(`/transactions?${params}`);
      exportTransactionsCSV(data.data);
    } catch (err) {
      setError(err.message || 'Export failed');
    } finally {
      setExporting(false);
    }
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="page">
      <div className="txn-header">
        <div>
          <h1 className="page-title">Transactions</h1>
          <p className="page-subtitle">{total} transaction{total !== 1 ? 's' : ''} total</p>
        </div>
        <div className="txn-actions">
          <button className="btn btn--outline" onClick={handleExportCSV} disabled={exporting}>
            <Download size={15} />
            {exporting ? 'Exporting…' : 'Export CSV'}
          </button>
          <button className="btn btn--primary" onClick={() => setShowAddModal(true)}>
            <Plus size={15} />
            Add Transaction
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="txn-filters">
        <select
          className="filter-select"
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          aria-label="Filter by category"
        >
          <option value="">All Categories</option>
          {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>

        <select
          className="filter-select"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          aria-label="Filter by type"
        >
          <option value="">All Types</option>
          <option value="income">Income</option>
          <option value="expense">Expense</option>
        </select>
      </div>

      {error && <div className="txn-error">{error}</div>}

      {/* Table */}
      <div className="txn-table-wrap">
        <table className="txn-table">
          <thead>
            <tr>
              <th
                className="txn-th txn-th--sortable"
                onClick={() => handleSort('date')}
              >
                Date <SortIcon field="date" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="txn-th">Description</th>
              <th
                className="txn-th txn-th--sortable txn-th--right"
                onClick={() => handleSort('amount')}
              >
                Amount <SortIcon field="amount" sortField={sortField} sortDir={sortDir} />
              </th>
              <th className="txn-th">Category</th>
              <th className="txn-th">Type</th>
              <th className="txn-th txn-th--action"></th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="txn-cell txn-cell--center">
                  <span className="spinner-sm" /> Loading…
                </td>
              </tr>
            ) : sortedRows.length === 0 ? (
              <tr>
                <td colSpan={6} className="txn-cell txn-cell--center txn-cell--muted">
                  No transactions found
                </td>
              </tr>
            ) : (
              sortedRows.map((txn) => (
                <tr key={txn.id} className="txn-row">
                  <td className="txn-cell">{formatDate(txn.date)}</td>
                  <td className="txn-cell txn-cell--desc">{txn.description}</td>
                  <td className={`txn-cell txn-cell--right txn-cell--amount txn-cell--${txn.type}`}>
                    {txn.type === 'expense' ? '−' : '+'}{formatCurrency(txn.amount)}
                  </td>
                  <td className="txn-cell">
                    <span className="txn-badge txn-badge--category">{txn.category}</span>
                  </td>
                  <td className="txn-cell">
                    <span className={`txn-badge txn-badge--type txn-badge--${txn.type}`}>
                      {txn.type}
                    </span>
                  </td>
                  <td className="txn-cell txn-cell--action">
                    <button
                      className="btn btn--sm btn--ghost txn-delete-btn"
                      onClick={() => setDeleteTarget({ id: txn.id, description: txn.description })}
                      aria-label="Delete transaction"
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="txn-pagination">
        <button
          className="btn btn--outline btn--sm"
          onClick={() => setPage((p) => Math.max(1, p - 1))}
          disabled={page <= 1 || loading}
        >
          Previous
        </button>
        <span className="txn-page-info">
          Page {page} of {totalPages}
        </span>
        <button
          className="btn btn--outline btn--sm"
          onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
          disabled={page >= totalPages || loading}
        >
          Next
        </button>
      </div>

      {/* Modals */}
      {showAddModal && (
        <TransactionModal
          onClose={() => setShowAddModal(false)}
          onSuccess={() => {
            setShowAddModal(false);
            fetchTransactions();
          }}
        />
      )}

      {deleteTarget && (
        <ConfirmDialog
          message={`Delete "${deleteTarget.description}"? This cannot be undone.`}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          loading={deleting}
        />
      )}
    </div>
  );
}
