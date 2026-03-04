const express = require('express');
const { readTransactions } = require('../middleware/dataStore');

const router = express.Router();

// GET /api/summary
// Returns last 6 months as [{month, income, expenses, balance}]
router.get('/', (req, res) => {
  const transactions = readTransactions();

  const now = new Date();
  const months = [];

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    months.push(`${year}-${month}`);
  }

  const summary = months.map(month => {
    const monthTx = transactions.filter(t => t.date && t.date.startsWith(month));
    const income = monthTx
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    const expenses = monthTx
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
    return {
      month,
      income: Math.round(income * 100) / 100,
      expenses: Math.round(expenses * 100) / 100,
      balance: Math.round((income - expenses) * 100) / 100,
    };
  });

  res.json(summary);
});

module.exports = router;
