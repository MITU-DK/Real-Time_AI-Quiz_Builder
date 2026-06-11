import { groq } from '../config/groq';
import { quizJsonSchema } from '../schemas/quiz.schema';

export const generateQuiz = async (topic: string, difficulty: string) => {
  const systemPrompt = `You are an expert educator and quiz builder. Your task is to generate a challenging, accurate, and educational quiz based on the user's requested topic and difficulty level.
Always provide exactly 4 options per question, with only one correct answer.
Make sure the correct option index is between 0 and 3.
Ensure the time limit is reasonable for the difficulty (e.g., 10, 20, 30, 45, 60 seconds) and points are standard (e.g., 100, 200, 500, 1000).`;

  const userPrompt = `Generate a 5-question quiz about "${topic}" at a "${difficulty}" difficulty level.`;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      model: 'llama-3.3-70b-specdec',
      temperature: 0.5,
      response_format: {
        type: 'json_schema',
        json_schema: {
          name: 'quiz_schema',
          strict: true,
          schema: quizJsonSchema
        }
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
