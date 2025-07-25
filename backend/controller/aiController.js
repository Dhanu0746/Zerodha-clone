const { askAI } = require('../utils/openai');

exports.ask = async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
    const response = await askAI(prompt);
    res.json({ response });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}; 