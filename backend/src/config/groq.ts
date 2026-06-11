import Groq from 'groq-sdk';
import dotenv from 'dotenv';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;

if (!apiKey) {
  console.warn('WARNING: GROQ_API_KEY is not defined in the environment variables.');
}

export const groq = new Groq({
  apiKey: apiKey || '',
});
