import { useState, useEffect } from 'react';
import {
  PieChart, Pie, Cell, Legend, Tooltip,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign } from 'lucide-react';
import { api } from '../utils/api';
import { format, parseISO } from 'date-fns';
import './Dashboard.css';

const INCOME_COLOR = '#22c55e';
const EXPENSE_COLOR = '#ef4444';

function formatCurrency(value) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
}

function formatMonth(monthStr) {
  try {
    return format(parseISO(`${monthStr}-01`), 'MMM yyyy');
  } catch {
    return monthStr;
  }
}

function BalanceCard({ summary }) {
  const totalIncome = summary.reduce((s, m) => s + m.income, 0);
  const totalExpenses = summary.reduce((s, m) => s + m.expenses, 0);
  const balance = totalIncome - totalExpenses;
  const positive = balance >= 0;

  return (
    <div className={`balance-card ${positive ? 'balance-card--positive' : 'balance-card--negative'}`}>
      <div className="balance-card-header">
        <span className="balance-card-label">Total Balance</span>
        <DollarSign size={20} className="balance-card-icon" />
      </div>
      <div className="balance-card-amount">{formatCurrency(balance)}</div>
      <div className="balance-card-meta">
        <span className="balance-card-income">
          <TrendingUp size={14} /> {formatCurrency(totalIncome)} income
        </span>
        <span className="balance-card-expense">
          <TrendingDown size={14} /> {formatCurrency(totalExpenses)} expenses
        </span>
      </div>
    </div>
  );
}

function DonutChart({ summary }) {
  const currentMonth = summary[summary.length - 1];
  const hasData = currentMonth && (currentMonth.income > 0 || currentMonth.expenses > 0);

  const data = [
    { name: 'Income', value: currentMonth?.income || 0 },
    { name: 'Expenses', value: currentMonth?.expenses || 0 },
  ].filter((d) => d.value > 0);

  if (!hasData) {
    return (
      <div className="chart-card">
        <h2 className="chart-title">This Month</h2>
        <div className="chart-empty">No transactions this month</div>
      </div>
    );
  }

  return (
    <div className="chart-card">
      <h2 className="chart-title">
        This Month
        {currentMonth && <span className="chart-subtitle"> — {formatMonth(currentMonth.month)}</span>}
      </h2>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={65}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
            label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
            labelLine={false}
          >
            {data.map((entry) => (
              <Cell
                key={entry.name}
                fill={entry.name === 'Income' ? INCOME_COLOR : EXPENSE_COLOR}
              />
            ))}
          </Pie>
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

function TrendChart({ summary }) {
  const hasData = summary.some((m) => m.income > 0 || m.expenses > 0);

  const data = summary.map((m) => ({
    month: formatMonth(m.month),
    Income: m.income,
    Expenses: m.expenses,
  }));

  if (!hasData) {
    return (
      <div className="chart-card chart-card--wide">
        <h2 className="chart-title">6-Month Trend</h2>
        <div className="chart-empty">No data yet</div>
      </div>
    );
  }

  return (
    <div className="chart-card chart-card--wide">
      <h2 className="chart-title">6-Month Trend</h2>
      <ResponsiveContainer width="100%" height={260}>
        <LineChart data={data} margin={{ top: 8, right: 16, left: 8, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} tick={{ fontSize: 12 }} />
          <Tooltip formatter={(v) => formatCurrency(v)} />
          <Legend />
          <Line
            type="monotone"
            dataKey="Income"
            stroke={INCOME_COLOR}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="Expenses"
            stroke={EXPENSE_COLOR}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

export default function Dashboard() {
  const [summary, setSummary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/summary')
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load dashboard data');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="dashboard-loading">
          <div className="spinner" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page">
        <h1 className="page-title">Dashboard</h1>
        <div className="dashboard-error">Unable to load data: {error}</div>
      </div>
    );
  }

  return (
    <div className="page">
      <h1 className="page-title">Dashboard</h1>
      <p className="page-subtitle">Your financial overview at a glance</p>

      <div className="dashboard-grid">
        <BalanceCard summary={summary} />
        <DonutChart summary={summary} />
        <TrendChart summary={summary} />
      </div>
    </div>
  );
}
