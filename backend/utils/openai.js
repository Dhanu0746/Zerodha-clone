const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

const askAI = async (prompt) => {
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful trading assistant. Give clear, concise, and actionable advice for stock trading questions.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    return completion.choices[0].message.content.trim();
  } catch (err) {
    console.error('OpenAI API error:', err.message);
    return 'Sorry, I could not process your request right now.';
  }
};

module.exports = { askAI };