const express = require('express');
const cors = require('cors');
const path = require('path');

const transactionsRouter = require('./routes/transactions');
const summaryRouter = require('./routes/summary');
const budgetsRouter = require('./routes/budgets');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

app.use('/api/transactions', transactionsRouter);
app.use('/api/summary', summaryRouter);
app.use('/api/budgets', budgetsRouter);

app.listen(PORT, () => {
  console.log(`Finance tracker backend running on port ${PORT}`);
});

module.exports = app;
