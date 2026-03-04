const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { CATEGORIES, readTransactions, writeTransactions } = require('../middleware/dataStore');

const router = express.Router();

// GET /api/transactions
router.get('/', (req, res) => {
  let transactions = readTransactions();

  const { month, category, type, page, limit } = req.query;

  if (month) {
    transactions = transactions.filter(t => t.date && t.date.startsWith(month));
  }

  if (category) {
    transactions = transactions.filter(t => t.category === category);
  }

  if (type) {
    transactions = transactions.filter(t => t.type === type);
  }

  // Sort by date descending
  transactions.sort((a, b) => new Date(b.date) - new Date(a.date));

  const total = transactions.length;
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const offset = (pageNum - 1) * limitNum;
  const data = transactions.slice(offset, offset + limitNum);

  res.json({ data, total, page: pageNum, limit: limitNum });
});

// POST /api/transactions
router.post('/', (req, res) => {
  const { date, description, amount, category, type } = req.body;

  const errors = [];

  if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
    errors.push('date is required and must be in YYYY-MM-DD format');
  }

  if (!description || typeof description !== 'string' || description.trim().length === 0) {
    errors.push('description is required');
  }

  if (amount === undefined || amount === null || typeof amount !== 'number' || amount <= 0) {
    errors.push('amount must be a number greater than 0');
  }

  if (!category || !CATEGORIES.includes(category)) {
    errors.push(`category must be one of: ${CATEGORIES.join(', ')}`);
  }

  if (!type || !['income', 'expense'].includes(type)) {
    errors.push('type must be income or expense');
  }

  if (errors.length > 0) {
    return res.status(400).json({ errors });
  }

  const newTransaction = {
    id: uuidv4(),
    date,
    description: description.trim(),
    amount,
    category,
    type,
  };

  const transactions = readTransactions();
  transactions.push(newTransaction);
  writeTransactions(transactions);

  res.status(201).json(newTransaction);
});

// DELETE /api/transactions/:id
router.delete('/:id', (req, res) => {
  const { id } = req.params;
  const transactions = readTransactions();
  const index = transactions.findIndex(t => t.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Transaction not found' });
  }

  const [deleted] = transactions.splice(index, 1);
  writeTransactions(transactions);

  res.json(deleted);
});

module.exports = router;
