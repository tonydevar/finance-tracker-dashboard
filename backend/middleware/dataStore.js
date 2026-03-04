const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '..', 'data');
const TRANSACTIONS_FILE = path.join(DATA_DIR, 'transactions.json');
const BUDGETS_FILE = path.join(DATA_DIR, 'budgets.json');

const CATEGORIES = ['Food', 'Transport', 'Bills', 'Entertainment', 'Shopping', 'Salary', 'Freelance', 'Other'];

function readTransactions() {
  try {
    const raw = fs.readFileSync(TRANSACTIONS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function writeTransactions(transactions) {
  fs.writeFileSync(TRANSACTIONS_FILE, JSON.stringify(transactions, null, 2), 'utf8');
}

function readBudgets() {
  try {
    const raw = fs.readFileSync(BUDGETS_FILE, 'utf8');
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function writeBudgets(budgets) {
  fs.writeFileSync(BUDGETS_FILE, JSON.stringify(budgets, null, 2), 'utf8');
}

module.exports = {
  CATEGORIES,
  readTransactions,
  writeTransactions,
  readBudgets,
  writeBudgets,
};
