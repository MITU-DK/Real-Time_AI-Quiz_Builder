import { groq } from '../config/groq';

export const generateQuiz = async (topic: string, difficulty: string, numQuestions: number = 5) => {
  const systemPrompt = `You are an expert educator and quiz builder. Your task is to generate a challenging, accurate, and educational quiz based on the user's requested topic and difficulty level.

You MUST respond with ONLY valid JSON — no prose, no markdown, no code blocks.
The JSON must exactly match this structure:

{
  "quiz_title": "string — a catchy title for the quiz",
  "quiz_difficulty": "easy" | "medium" | "hard",
  "time_limit_seconds": 10,
  "points": 100 | 200 | 500 | 1000,
  "questions": [
    {
      "question_text": "string",
      "options": ["string", "string", "string", "string"],
      "correct_option_index": 0 | 1 | 2 | 3
    }
  ]
}

Rules:
- "questions" must contain exactly ${numQuestions} items.
- "options" must contain exactly 4 strings per question.
- "correct_option_index" must be an integer from 0 to 3.
- Do not add any extra fields.
- Do not wrap the JSON in markdown or backticks.`;

  const userPrompt = `Generate a ${numQuestions}-question quiz about "${topic}" at a "${difficulty}" difficulty level.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: {
        type: 'json_object',
      }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No content returned from Groq API');
    }

    return JSON.parse(responseContent);
  } catch (error) {
    console.error('Error in AI Quiz Generation:', error);
    throw new Error('Failed to generate quiz from AI service');
  }
};

/* ---oi tried to get result in fixed stuctured output, rightnow groq doesnt have that api for free user
import { groq } from '../config/groq';

export const generateQuiz = async (topic: string, difficulty: string) => {
  const systemPrompt = `You are an expert educator and quiz builder. Your task is to generate a challenging, accurate, and educational quiz based on the user's requested topic and difficulty level.

You MUST respond with ONLY valid JSON — no prose, no markdown, no code blocks.
The JSON must exactly match this structure:

{
  "quiz_title": "string — a catchy title for the quiz",
  "quiz_difficulty": "easy" | "medium" | "hard",
  "time_limit_seconds": 10 | 20 | 30 | 45 | 60,
  "points": 100 | 200 | 500 | 1000,
  "questions": [
    {
      "question_text": "string",
      "options": ["string", "string", "string", "string"],
      "correct_option_index": 0 | 1 | 2 | 3
    }
  ]
}

Rules:
- "questions" must contain exactly 5 items.
- "options" must contain exactly 4 strings per question.
- "correct_option_index" must be an integer from 0 to 3.
- Do not add any extra fields.
- Do not wrap the JSON in markdown or backticks.`;

  const userPrompt = `Generate a 5-question quiz about "${topic}" at a "${difficulty}" difficulty level.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-versatile',
      temperature: 0.5,
      response_format: {
        type: 'json_object',
      }
    });

    const responseContent = chatCompletion.choices[0]?.message?.content;
    if (!responseContent) {
      throw new Error('No content returned from Groq API');
    }

    return JSON.parse(responseContent);
  } catch (error) {
    console.error('Error in AI Quiz Generation:', error);
    throw new Error('Failed to generate quiz from AI service');
  }
};
*/