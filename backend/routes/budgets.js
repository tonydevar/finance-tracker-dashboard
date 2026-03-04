const express = require('express');
const { CATEGORIES, readTransactions, readBudgets, writeBudgets } = require('../middleware/dataStore');

const router = express.Router();

// GET /api/budgets
// Returns all 8 categories with monthlyLimit, spent for current calendar month, over boolean
router.get('/', (req, res) => {
  const budgets = readBudgets();
  const transactions = readTransactions();

  const now = new Date();
  const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = transactions.filter(
    t => t.type === 'expense' && t.date && t.date.startsWith(currentMonth)
  );

  const result = CATEGORIES.map(category => {
    const monthlyLimit = budgets[category] || 0;
    const spent = currentMonthExpenses
      .filter(t => t.category === category)
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      category,
      monthlyLimit: Math.round(monthlyLimit * 100) / 100,
      spent: Math.round(spent * 100) / 100,
      over: monthlyLimit > 0 && spent > monthlyLimit,
    };
  });

  res.json(result);
});

// PUT /api/budgets/:category
router.put('/:category', (req, res) => {
  const { category } = req.params;
  const { monthlyLimit } = req.body;

  if (!CATEGORIES.includes(category)) {
    return res.status(400).json({ error: `category must be one of: ${CATEGORIES.join(', ')}` });
  }

  if (monthlyLimit === undefined || monthlyLimit === null || typeof monthlyLimit !== 'number' || monthlyLimit <= 0) {
    return res.status(400).json({ error: 'monthlyLimit must be a number greater than 0' });
  }

  const budgets = readBudgets();
  budgets[category] = Math.round(monthlyLimit * 100) / 100;
  writeBudgets(budgets);

  res.json({ category, monthlyLimit: budgets[category] });
});

module.exports = router;
