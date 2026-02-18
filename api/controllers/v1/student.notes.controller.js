const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess, sendError } = require("../../utils/responses/ApiResponse");
const STATUS = require("../../utils/status");
const QuizAttempt = require("../../models/quizAttempts.model");
const StudyNote = require("../../schemas/StudyNote");
const LLMFactory = require("../../services/llm/LLMFactory");
const mongoose = require("mongoose");
const AppError = require("../../utils/AppError");

const studentNotesController = {
  /**
   * Get student's study notes history
   */
  getNotesHistory: asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;

    const notes = await StudyNote.find({ userId }).sort({ version: 1 });

    return sendSuccess(res, STATUS.OK, "Study notes retrieved", {
      notes,
      totalGenerated: notes.length,
    });
  }),

  /**
   * Generate new study notes based on performance in a specific test
   */
  generateNotes: asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    const { attemptId } = req.body;

    if (!attemptId) {
      throw new AppError(
        "Attempt ID is required to generate targeted notes.",
        STATUS.BAD_REQUEST,
      );
    }

    // 1. Check existing notes count (Limit of 2 PER ATTEMPT)
    const existingCount = await StudyNote.countDocuments({
      userId,
      attemptId,
    });

    if (existingCount >= 2) {
      throw new AppError(
        "You have already generated the maximum of 2 study notes for this assessment attempt.",
        STATUS.FORBIDDEN,
      );
    }

    // 2. Identify weak topics specific to THIS attempt
    const attempt = await QuizAttempt.Model.findById(attemptId)
      .populate({
        path: "answers.questionId",
        populate: { path: "topicId" },
      })
      .populate({
        path: "quizId",
        select: "title unitId",
        populate: {
          path: "unitId",
          select: "name subjectId",
          populate: {
            path: "subjectId",
            select: "name",
          },
        },
      });

    if (!attempt || attempt.userId.toString() !== userId.toString()) {
      throw new AppError(
        "Assessment attempt not found or unauthorized.",
        STATUS.NOT_FOUND,
      );
    }

    // Get unique weak topics and detailed mistakes
    const weakTopicsSet = new Set();
    const mistakes = [];

    attempt.answers.forEach((answer) => {
      if (!answer.isCorrect && answer.questionId && answer.questionId.topicId) {
        weakTopicsSet.add(answer.questionId.topicId.name);

        // Extract mistake details for LLM context
        const question = answer.questionId;
        const selectedOpt = question.options.find(
          (o) => o.key === answer.selectedOption,
        );
        mistakes.push({
          question: question.questionText,
          userAnswer: selectedOpt
            ? `${answer.selectedOption}) ${selectedOpt.text}`
            : answer.selectedOption || "No Answer",
          topic: question.questionId?.topicId?.name || "General",
        });
      }
    });

    const topicsToCover = Array.from(weakTopicsSet).slice(0, 5);

    if (topicsToCover.length === 0) {
      throw new AppError(
        "No weak areas found in this assessment. Great job! No boosted notes needed.",
        STATUS.BAD_REQUEST,
      );
    }

    // 3. Generate notes using LLM with enhanced context
    const llmProvider = LLMFactory.getProvider();

    // Prepare context
    const context = {
      quiz: attempt.quizId?.title || "Unknown Quiz",
      unit: attempt.quizId?.unitId?.name || "Unknown Unit",
    };

    const generatedData = await llmProvider.generateStudyNotes({
      topics: topicsToCover,
      mistakes: mistakes.slice(0, 5), // Limit to top 5 mistakes to avoid token limits
      context,
    });

    // 4. Save the note with context
    const newNote = await StudyNote.create({
      userId,
      attemptId,
      quizId: attempt.quizId?._id,
      unitId: attempt.quizId?.unitId?._id,
      subjectId: attempt.quizId?.unitId?.subjectId?._id,
      topics: topicsToCover,
      summary: generatedData.summary,
      keyPoints: generatedData.keyPoints,
      detailedContent: generatedData.detailedContent,
      version: existingCount + 1,
    });

    return sendSuccess(
      res,
      STATUS.CREATED,
      "Study notes generated successfully",
      {
        note: newNote,
      },
    );
  }),
};

module.exports = studentNotesController;
