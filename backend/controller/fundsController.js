const Transaction = require('../models/Transaction');
const User = require('../models/User');

// Add funds
exports.addFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
    const user = await User.findById(req.user.userId);
    user.balance = (user.balance || 0) + amount;
    await user.save();
    const transaction = new Transaction({
      user: user._id,
      type: 'add',
      amount,
      balanceAfter: user.balance
    });
    await transaction.save();
    res.status(201).json({ balance: user.balance, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Withdraw funds
exports.withdrawFunds = async (req, res) => {
  try {
    const { amount } = req.body;
    if (amount <= 0) return res.status(400).json({ message: 'Amount must be positive' });
    const user = await User.findById(req.user.userId);
    if ((user.balance || 0) < amount) return res.status(400).json({ message: 'Insufficient balance' });
    user.balance -= amount;
    await user.save();
    const transaction = new Transaction({
      user: user._id,
      type: 'withdraw',
      amount,
      balanceAfter: user.balance
    });
    await transaction.save();
    res.status(201).json({ balance: user.balance, transaction });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Get transaction history
exports.getTransactions = async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.userId }).sort({ createdAt: -1 });
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 

// Get current balance
exports.getBalance = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId);
    res.json({ balance: user.balance || 0 });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
