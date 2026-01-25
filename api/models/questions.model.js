const { Question } = require("../schemas/Question");
const mongoose = require("mongoose");

const questionsModel = {
  /**
   * Get random active questions for a unit
   */
  getQuestionsForQuiz: async ({ unitId, limit }) => {
    return Question.aggregate([
      {
        $match: { unitId: new mongoose.Types.ObjectId(unitId), isActive: true },
      },
      { $sample: { size: limit } },
    ]);
  },

  /**
   * Get questions by IDs
   */
  getQuestionsByIds: async (ids) => {
    return Question.find({ _id: { $in: ids } });
  },

  Model: Question,
};

module.exports = questionsModel;
