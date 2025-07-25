const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const askAI = async (prompt) => {
  try {
    const completion = await openai.createChatCompletion({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful trading assistant. Give clear, concise, and actionable advice for stock trading questions.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 200,
      temperature: 0.7,
    });
    return completion.data.choices[0].message.content.trim();
  } catch (err) {
    console.error('OpenAI API error:', err.message);
    return 'Sorry, I could not process your request right now.';
  }
};

module.exports = { askAI }; 