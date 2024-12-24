const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
})
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Transaction Schema with user reference
const transactionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: String,
  amount: Number,
  type: String,
  category: String,
  date: { type: Date, default: Date.now }
});

const Transaction = mongoose.model('Transaction', transactionSchema);

// User Routes
app.post('/api/users/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'Username already exists' });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ userId: user._id, username: user.username });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.post('/api/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user || user.password !== password) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    res.json({ userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Transaction Routes
app.get('/api/transactions', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.post('/api/transactions', async (req, res) => {
  try {
    const { userId, ...transactionData } = req.body;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const transaction = new Transaction({ ...transactionData, userId });
    await transaction.save();
    res.status(201).json(transaction);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

app.delete('/api/transactions/:id', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    await Transaction.findOneAndDelete({ _id: req.params.id, userId });
    res.status(204).send();
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Export transactions to CSV
app.get('/api/transactions/export', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const transactions = await Transaction.find({ userId }).sort({ date: -1 });
    
    // Create CSV header
    const csvHeader = 'Date,Title,Amount,Type,Category\n';
    
    // Create CSV rows
    const csvRows = transactions.map(t => {
      const type = t.amount < 0 ? 'expense' : 'income';
      const date = new Date(t.date).toLocaleDateString();
      return `${date},"${t.title}",${Math.abs(t.amount)},${type},${t.category}`;
    }).join('\n');
    
    // Combine header and rows
    const csv = csvHeader + csvRows;
    
    // Set headers for file download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');
    
    res.send(csv);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

app.get('/api/transactions/summary', async (req, res) => {
  try {
    const { userId } = req.query;
    if (!userId) {
      return res.status(400).json({ message: 'User ID is required' });
    }
    const summary = await Transaction.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$category',
          total: { $sum: '$amount' }
        }
      }
    ]);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
  console.log('Environment:', process.env.NODE_ENV || 'development');
});

// Global error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});
