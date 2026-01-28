
const OpenAI = require('openai');

let openai = null;

if (!process.env.OPENAI_API_KEY) {
  console.warn(
    'OPENAI_API_KEY is not set. AI evaluation endpoints will not work until it is configured.'
  );
} else {
  
  openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });
}

module.exports = openai;


