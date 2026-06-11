export const quizJsonSchema = {
  type: "object",
  properties: {
    quiz_title: {
      type: "string",
      description: "A catchy and relevant title for the quiz"
    },
    quiz_difficulty: {
      type: "string",
      enum: ["easy", "medium", "hard"],
      description: "The difficulty level of the quiz"
    },
    time_limit_seconds: {
      type: "integer",
      enum: [10, 20, 30, 45, 60],
      description: "Time limit per question in seconds"
    },
    points: {
      type: "integer",
      enum: [100, 200, 500, 1000],
      description: "Points awarded for each correct answer"
    },
    questions: {
      type: "array",
      description: "List of quiz questions",
      items: {
        type: "object",
        properties: {
          question_text: {
            type: "string",
            description: "The question being asked"
          },
          options: {
            type: "array",
            items: {
              type: "string"
            },
            minItems: 4,
            maxItems: 4,
            description: "Exactly 4 possible answers"
          },
          correct_option_index: {
            type: "integer",
            minimum: 0,
            maximum: 3,
            description: "The index of the correct option (0-3)"
          }
        },
        required: ["question_text", "options", "correct_option_index"],
        additionalProperties: false
      }
    }
  },
  required: ["quiz_title", "quiz_difficulty", "time_limit_seconds", "points", "questions"],
  additionalProperties: false
};
