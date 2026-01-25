const { QuizAttempt } = require("../schemas/QuizAttempt");

const quizAttemptsModel = {
  createAttempt: async (data) => {
    return QuizAttempt.create(data);
  },

  getAttemptById: async (id) => {
    return QuizAttempt.findById(id).populate("unitAttemptId");
  },

  updateAttempt: async (id, updates) => {
    return QuizAttempt.findByIdAndUpdate(id, updates, { new: true });
  },

  evaluateAndSubmit: async (attemptId, answers) => {
    const quizAttempt = await QuizAttempt.findById(attemptId);
    if (!quizAttempt) {
      throw new Error("Quiz attempt not found");
    }

    if (quizAttempt.status !== "IN_PROGRESS") {
      throw new Error("Assessment already submitted");
    }

    // Lazy load to avoid circular dependency
    const questionsModel = require("./questions.model");
    const questionIds = answers.map((a) => a.questionId);

    // Fetch questions with populated Topic details
    const questions = await questionsModel.Model.find({
      _id: { $in: questionIds },
    }).populate("topicId", "name");

    const questionMap = new Map(questions.map((q) => [q._id.toString(), q]));

    let score = 0;
    const evaluatedAnswers = [];
    const incorrectTopicsMap = new Map();

    for (const answer of answers) {
      const question = questionMap.get(answer.questionId);
      if (!question) continue;

      const isCorrect = question.correctOption === answer.selectedOption;
      if (isCorrect) {
        score++;
      } else {
        // Track weak topics
        if (question.topicId) {
          // Check if topic exists
          const topicIdStr = question.topicId._id.toString();
          if (!incorrectTopicsMap.has(topicIdStr)) {
            incorrectTopicsMap.set(topicIdStr, {
              topicCode: question.topicId._id
                .toString()
                .substring(0, 6)
                .toUpperCase(), // Mock code from ID
              topicTitle: question.topicId.name,
              subtopics: new Set(),
            });
          }
          // Assuming subtopic might be part of the question or just general topic weakness
          // If question has a 'subtopic' field or similar, add it.
          // Since schema defines 'topicId' but no distinct subtopic field on Question (checked schema),
          // we might just use Topic Name or a placeholder if finer granularity isn't available.
          // The UI expects subtopics array. Let's add the Question's "concept" if available or just generic text.
          incorrectTopicsMap.get(topicIdStr).subtopics.add("General Concepts");
        }
      }

      evaluatedAnswers.push({
        questionId: question._id,
        selectedOption: answer.selectedOption,
        isCorrect,
      });
    }

    const percentage = (score / quizAttempt.totalQuestions) * 100;

    // Format weakTopics for UI
    const weakTopics = Array.from(incorrectTopicsMap.values()).map((t) => ({
      ...t,
      subtopics: Array.from(t.subtopics),
    }));

    const updatedAttempt = await quizAttemptsModel.updateAttempt(attemptId, {
      answers: evaluatedAnswers,
      score,
      percentage,
      status: "SUBMITTED",
      completedAt: new Date(),
    });

    // Return extended result
    return {
      ...updatedAttempt.toObject(),
      weakTopics,
    };
  },

  Model: QuizAttempt,
};

module.exports = quizAttemptsModel;
