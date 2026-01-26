const { Quiz } = require("../schemas/Quiz");

const quizzesModel = {
  createQuiz: async ({
    unitId,
    type,
    questionIds,
    totalQuestions,
    generatedBy,
    generationContext,
  }) => {
    return Quiz.create({
      unitId,
      type,
      questionIds,
      totalQuestions,
      generatedBy,
      generationContext,
    });
  },

  Model: Quiz,
};

module.exports = quizzesModel;
