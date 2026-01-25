const asyncHandler = require("../../utils/asyncHandler");
const AppError = require("../../utils/AppError");
const STATUS = require("../../utils/status");
const { sendSuccess } = require("../../utils/responses/ApiResponse");
const questionsModel = require("../../models/questions.model");
const quizzesModel = require("../../models/quizzes.model");
const quizAttemptsModel = require("../../models/quizAttempts.model");
const unitAttemptsModel = require("../../models/unitAttempts.model");
const { UNIT_STATES } = require("../../schemas/UnitAttempt");
const { ATTEMPT_STATUS, QUIZ_TYPES } = require("../../schemas/QuizAttempt");

const assessmentsController = {
  /**
   * Start an assessment for a unit
   * POST /api/v1/assessments/:unitId/start
   */
  startAssessment: asyncHandler(async (req, res) => {
    const { unitId } = req.params;
    const userId = req.user.userId || req.user._id;

    if (!unitId) {
      throw new AppError("Unit ID is required", STATUS.BAD_REQUEST);
    }

    // 1. Check/Create UnitAttempt
    let unitAttempt = await unitAttemptsModel.findOrCreate({ userId, unitId });
    let quizType = QUIZ_TYPES.DIAGNOSTIC;

    if (
      unitAttempt.state === UNIT_STATES.DIAGNOSTIC_COMPLETED ||
      unitAttempt.state === UNIT_STATES.IN_PROGRESS ||
      unitAttempt.state === UNIT_STATES.MASTERED
    ) {
      quizType = QUIZ_TYPES.ADAPTIVE;
    }

    // 2. Fetch Questions (Logic previously in quizService)
    const questions = await questionsModel.getQuestionsForQuiz({
      unitId,
      limit: 10,
    });

    if (!questions || questions.length === 0) {
      throw new AppError(
        "No questions available for this unit",
        STATUS.NOT_FOUND,
      );
    }

    // 3. Create Quiz
    const quiz = await quizzesModel.createQuiz({
      unitId,
      type: quizType,
      questionIds: questions.map((q) => q._id),
      totalQuestions: questions.length,
      generatedBy: "SYSTEM",
      generationContext: `${quizType} Assessment generated on ${new Date().toISOString()}`,
    });

    // 4. Create QuizAttempt
    const quizAttempt = await quizAttemptsModel.createAttempt({
      userId,
      unitAttemptId: unitAttempt._id,
      quizId: quiz._id,
      quizType,
      status: ATTEMPT_STATUS.IN_PROGRESS,
      totalQuestions: questions.length,
      startedAt: new Date(),
    });

    // 5. Update UnitAttempt connection/state
    if (quizType === QUIZ_TYPES.DIAGNOSTIC) {
      await unitAttemptsModel.updateState(unitAttempt._id, {
        diagnosticQuizId: quiz._id,
      });
    } else {
      await unitAttemptsModel.updateState(unitAttempt._id, {
        state: UNIT_STATES.IN_PROGRESS,
      });
    }

    // 6. Return response
    const sanitizedQuestions = questions.map((q) => ({
      _id: q._id,
      questionText: q.questionText,
      options: q.options,
    }));

    return sendSuccess(res, STATUS.CREATED, "Assessment started successfully", {
      attemptId: quizAttempt._id,
      quizType,
      questions: sanitizedQuestions,
      totalQuestions: questions.length,
    });
  }),

  /**
   * Submit an assessment
   * POST /api/v1/assessments/:attemptId/submit
   */
  submitAssessment: asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const { answers } = req.body;

    if (!answers || !Array.isArray(answers)) {
      throw new AppError("Answers must be an array", STATUS.BAD_REQUEST);
    }

    const quizAttempt = await quizAttemptsModel.getAttemptById(attemptId);
    if (!quizAttempt) {
      throw new AppError("Quiz attempt not found", STATUS.NOT_FOUND);
    }

    if (quizAttempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
      throw new AppError("Assessment already submitted", STATUS.BAD_REQUEST);
    }

    // 1. Evaluate Answers & Submit
    const result = await quizAttemptsModel.evaluateAndSubmit(
      attemptId,
      answers,
    );

    // 2. Handle Unit Progression
    // quizAttempt.unitAttemptId is populated, so we extract the _id
    const unitAttemptId =
      quizAttempt.unitAttemptId._id || quizAttempt.unitAttemptId;
    const unitAttemptUpdates = await unitAttemptsModel.handleQuizCompletion(
      unitAttemptId,
      quizAttempt.quizType,
      result.percentage,
    );

    return sendSuccess(res, STATUS.OK, "Assessment submitted successfully", {
      attemptId: result._id,
      score: result.score,
      accuracy: result.percentage, // UI expects 'accuracy' key
      percentage: result.percentage,
      weakTopics: result.weakTopics || [], // Pass rich analysis to UI
      masteryAchieved: unitAttemptUpdates.masteryAchieved,
      state: unitAttemptUpdates.state,
    });
  }),
};

module.exports = assessmentsController;
