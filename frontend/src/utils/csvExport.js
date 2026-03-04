/**
 * Exports an array of transaction objects as a CSV download.
 * Uses Blob + object URL — works in all modern browsers.
 */
export function exportTransactionsCSV(transactions, filename = 'transactions.csv') {
  const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];

  const rows = transactions.map((t) => [
    t.date,
    `"${(t.description || '').replace(/"/g, '""')}"`,
    t.amount,
    t.category,
    t.type,
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
