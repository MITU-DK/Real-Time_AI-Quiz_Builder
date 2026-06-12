import { groq } from './config/groq';
import { quizJsonSchema } from './schemas/quiz.schema';

async function testModel(model: string) {
  try {
    console.log(`Testing ${model} with useSchema=true...`);
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        { role: 'system', content: 'You are a quiz builder. Generate a 1-question quiz in JSON.' },
        { role: 'user', content: 'Topic: HTML. Output valid JSON.' }
      ],
      model: model,
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
    console.log(`✅ Success with ${model}`);
  } catch (err: any) {
    console.error(`❌ Failed with ${model}:`, err.message || err);
  }
}

async function main() {
  await testModel('groq/compound');
  await testModel('groq/compound-mini');
}

main();
