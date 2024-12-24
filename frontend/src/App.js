import React, { useState, useEffect } from 'react';
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import Login from './components/Login';
import { api, API_URL } from './api';

ChartJS.register(ArcElement, Tooltip, Legend);

const CURRENCIES = [
  { code: 'USD', symbol: '$' },
  { code: 'EUR', symbol: '€' },
  { code: 'GBP', symbol: '£' },
  { code: 'INR', symbol: '₹' },
  { code: 'JPY', symbol: '¥' }
];

const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Groceries',
  'Other'
];

const INCOME_CATEGORIES = [
  'Salary',
  'Freelance',
  'Investments',
  'Business',
  'Other Income'
];

function App() {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [transactions, setTransactions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: '',
    date: new Date().toISOString().split('T')[0],
  });

  const [summary, setSummary] = useState([]);
  const [balance, setBalance] = useState(0);
  const [currency, setCurrency] = useState(CURRENCIES[0]);

  // Initialize user and fetch data
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      const userData = JSON.parse(savedUser);
      setUser(userData);
    }
  }, []);

  // Fetch transactions and summary when user changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user) return;

      try {
        const [transactionsRes, summaryRes] = await Promise.all([
          api.get('/transactions'),
          api.get('/transactions/summary')
        ]);
        setTransactions(transactionsRes.data);
        setSummary(summaryRes.data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [user]);

  // Update balance when transactions change
  useEffect(() => {
    const total = transactions.reduce((acc, curr) => acc + curr.amount, 0);
    setBalance(total);
  }, [transactions]);

  if (!user) {
    return <Login onLogin={setUser} />;
  }

  // Refresh data after changes
  const refreshData = async () => {
    try {
      const [transactionsRes, summaryRes] = await Promise.all([
        api.get('/transactions'),
        api.get('/transactions/summary')
      ]);
      setTransactions(transactionsRes.data);
      setSummary(summaryRes.data);
    } catch (error) {
      console.error('Error refreshing data:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post('/transactions', {
        ...formData,
        amount: formData.type === 'expense' ? -Math.abs(formData.amount) : Math.abs(formData.amount),
      });
      setFormData({ 
        title: '', 
        amount: '', 
        type: 'expense', 
        category: '', 
        date: new Date().toISOString().split('T')[0] 
      });
      await refreshData();
    } catch (error) {
      console.error('Error adding transaction:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      await refreshData();
    } catch (error) {
      console.error('Error deleting transaction:', error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setTransactions([]);
    setSummary([]);
    setBalance(0);
  };

  const chartData = {
    labels: summary.map(item => item._id),
    datasets: [
      {
        label: 'Amount',
        data: summary.map(item => Math.abs(item.total)),
        backgroundColor: summary.map(() => 
          `rgba(${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, ${Math.floor(Math.random() * 255)}, 0.6)`
        ),
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
        labels: {
          padding: 20,
          color: '#fff',
          font: {
            size: 12
          }
        }
      },
      title: {
        display: true,
        text: 'Spending by Category',
        color: '#fff',
        font: {
          size: 20
        }
      },
      tooltip: {
        callbacks: {
          label: (context) => {
            const value = context.raw;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${currency.symbol}${value.toFixed(2)} (${percentage}%)`;
          }
        }
      }
    },
  };

  return (
    <div className="container mt-4 text-light">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1 style={{ fontWeight: 'bold' }}>
          Expense Tracker
        </h1>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex align-items-center">
            <label className="me-2">Currency:</label>
            <select 
              className="form-select bg-dark text-light border-secondary"
              style={{ backgroundColor: '#212529' }}
              value={currency.code}
              onChange={(e) => setCurrency(CURRENCIES.find(c => c.code === e.target.value))}
            >
              {CURRENCIES.map(c => (
                <option key={c.code} value={c.code}>{c.code} ({c.symbol})</option>
              ))}
            </select>
          </div>
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-outline-success"
              onClick={() => window.location.href = `${API_URL}/transactions/export?userId=${user.userId}`}
            >
              Export CSV
            </button>
            <div>
              <span className="me-3">Welcome, {user.username}!</span>
              <button 
                className="btn btn-outline-danger"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
      
      <div className="row mb-4">
        <div className="col-12">
          <div className="card text-white" style={{ backgroundColor: '#0d6efd', borderColor: '#0a58ca' }}>
            <div className="card-body text-center">
              <h3 className="mb-3">Current Balance</h3>
              <h2 className="mb-0">{currency.symbol}{Math.abs(balance).toFixed(2)}</h2>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-md-6">
          <div className="card mb-4 shadow text-light border-secondary" style={{ backgroundColor: '#212529' }}>
            <div className="card-body" style={{ backgroundColor: '#212529' }}>
              <h5 className="card-title text-info">Add Transaction</h5>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Title</label>
                  <input
                    type="text"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Enter title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Date</label>
                  <input
                    type="date"
                    className="form-control bg-dark text-light border-secondary"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Amount</label>
                  <input
                    type="number"
                    className="form-control bg-dark text-light border-secondary"
                    placeholder="Enter amount"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Type</label>
                  <select
                    className="form-select bg-dark text-light border-secondary"
                    style={{ backgroundColor: '#212529' }}
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value, category: '' })}
                  >
                    <option value="expense">Expense</option>
                    <option value="income">Income</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select bg-dark text-light border-secondary"
                    style={{ 
                      cursor: 'pointer',
                      backgroundColor: '#212529'
                    }}
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                  >
                    <option value="">Select Category</option>
                    {(formData.type === 'expense' ? CATEGORIES : INCOME_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <button type="submit" className="btn btn-primary w-100">
                  Add Transaction
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-6">
          <div className="card mb-4 shadow text-light border-secondary" style={{ backgroundColor: '#212529' }}>
            <div className="card-body" style={{ backgroundColor: '#212529' }}>
              <h5 className="card-title text-info">Recent Transactions</h5>
              <div className="list-group" style={{ maxHeight: '470px', overflowY: 'auto' }}>
                {transactions.map((transaction) => (
                  <div 
                    key={transaction._id} 
                    className="list-group-item list-group-item-action border-left border-3 bg-dark text-light border-secondary mb-2"
                    style={{
                      borderLeft: `5px solid ${transaction.amount < 0 ? '#dc3545' : '#28a745'}`,
                      borderTop: '1px solid rgba(255,255,255,0.1)',
                      borderBottom: '1px solid rgba(255,255,255,0.1)'
                    }}
                  >
                    <div className="d-flex w-100 justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-1">{transaction.title}</h6>
                        <span className="badge bg-secondary">{transaction.category}</span>
                      </div>
                      <div className="text-end">
                        <h5 className={transaction.amount < 0 ? 'text-danger mb-1' : 'text-success mb-1'}>
                          {currency.symbol}{Math.abs(transaction.amount).toFixed(2)}
                        </h5>
                        <small className="text-muted d-block">
                          {new Date(transaction.date).toLocaleDateString()}
                        </small>
                        <button
                          className="btn btn-outline-danger btn-sm mt-2"
                          onClick={() => handleDelete(transaction._id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-12">
          <div className="card shadow text-light border-secondary" style={{ backgroundColor: '#212529' }}>
            <div className="card-body" style={{ backgroundColor: '#212529' }}>
              <div style={{ maxHeight: '400px' }}>
                <Pie data={chartData} options={chartOptions} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
