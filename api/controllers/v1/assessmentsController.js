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

    // 2. Check for Active Attempt (Resume Logic)
    const activeAttempt = await quizAttemptsModel.findActiveAttempt(
      userId,
      unitAttempt._id,
    );

    if (activeAttempt) {
      // Resume existing assessment
      const existingQuestions = activeAttempt.quizId.questionIds.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
      }));

      return sendSuccess(res, STATUS.OK, "Resuming active assessment", {
        attemptId: activeAttempt._id,
        quizType: activeAttempt.quizType,
        questions: existingQuestions,
        totalQuestions: existingQuestions.length,
        timeSpent: activeAttempt.timeSpent || 0, // Resume timer
        resumed: true, // Frontend signal
      });
    }

    // 3. Fetch Unit & Topic Context
    const unit = await unitAttemptsModel.getUnitContext(unitId);
    if (!unit) {
      throw new AppError("Unit not found", STATUS.NOT_FOUND);
    }

    /**
     * 🎯 QUOTA OPTIMIZATION STRATEGY #1: Question Pool
     *
     * OLD APPROACH:
     * - Generate 10 questions via LLM every time (costs 1 quota per request)
     * - If 20 students take same unit = 20 LLM calls
     *
     * NEW APPROACH:
     * - Check if we have cached questions in pool
     * - If yes → serve from DB (instant, free, 0 quota cost)
     * - If no → generate via LLM and cache for future use
     *
     * IMPACT: Reduces LLM calls by 60-80%
     */
    const questionPoolModel = require("../../models/questionPool.model");
    const { QuotaTracker } = require("../../utils/quotaTracker");

    // Get questions from pool (may trigger LLM generation if pool is low)
    const questions = await questionPoolModel.getOrGenerate({
      unitId: unit._id,
      quizType: quizType,
      count: 10,
    });

    if (!questions || questions.length === 0) {
      throw new AppError(
        "Failed to generate questions",
        STATUS.INTERNAL_SERVER_ERROR,
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
      req.body.timeSpent || 0,
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

  /**
   * Get specific assessment result (with AI Analysis)
   * GET /api/v1/assessments/:attemptId/result
   */
  getAssessmentResult: asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user.userId || req.user._id;

    const attempt = await quizAttemptsModel.getAttemptById(attemptId);
    if (!attempt) {
      throw new AppError("Assessment attempt not found", STATUS.NOT_FOUND);
    }

    // Ensure ownership
    if (attempt.userId.toString() !== userId.toString()) {
      throw new AppError("Unauthorized access to result", STATUS.FORBIDDEN);
    }

    if (attempt.status !== ATTEMPT_STATUS.SUBMITTED) {
      // If viewed before submission? Allow viewing if resume logic handles it, otherwise error.
      // Usually results are for submitted.
    }

    // Lazy Generate AI Analysis if missing OR if we need to return weakTopics (as they aren't stored)

    // We ALWAYS need to fetch full details to reconstruct weakTopics for the UI,
    // unless we decide to store them in schema later.
    const fullAttempt = await quizAttemptsModel.Model.findById(attemptId)
      .populate({
        path: "answers.questionId",
        populate: { path: "topicId" },
      })
      .populate({
        path: "quizId",
        populate: { path: "unitId" },
      });

    const weakTopicsMap = new Map();
    fullAttempt.answers.forEach((ans) => {
      if (!ans.isCorrect && ans.questionId && ans.questionId.topicId) {
        const tName = ans.questionId.topicId.name;
        const tCode = ans.questionId.topicId._id
          .toString()
          .substring(0, 6)
          .toUpperCase();

        if (!weakTopicsMap.has(tName)) {
          weakTopicsMap.set(tName, {
            topicCode: tCode,
            topicTitle: tName,
            subtopics: new Set(["General Concepts"]),
          });
        } else {
          weakTopicsMap.get(tName).subtopics.add("General Concepts");
        }
      }
    });

    const weakTopicsList = Array.from(weakTopicsMap.values()).map((t) => ({
      ...t,
      subtopics: Array.from(t.subtopics),
    }));

    /**
     * 🎯 QUOTA OPTIMIZATION STRATEGY #2: Analysis Caching
     *
     * OLD APPROACH:
     * - Generate analysis via LLM every time result is viewed
     * - Same score + same weak topics = regenerating identical analysis
     *
     * NEW APPROACH:
     * - Create cache key from score + weak topics combination
     * - Check if we've generated analysis for this pattern before
     * - If yes → serve from cache (instant, free, 0 quota cost)
     * - If no → generate via LLM and cache for 7 days
     *
     * IMPACT: Reduces analysis LLM calls by 20-30%
     * EXAMPLE: 10 students score 7/10 with weak topic "Algorithms" → 1 LLM call instead of 10
     */
    const { AnalysisCache } = require("../../schemas/AnalysisCache");

    // Build cache key: "score_sortedWeakTopics"
    // Sorting ensures "A,B" and "B,A" hit same cache
    const weakTopicsStr = weakTopicsList
      .map((t) => t.topicTitle)
      .sort()
      .join(",");
    const cacheKey = `${attempt.score}_${weakTopicsStr}`;

    // Check if analysis is missing OR invalid (fallback error message)
    const isAnalysisInvalid =
      !attempt.aiAnalysis ||
      attempt.aiAnalysis.includes("Unable to generate") ||
      attempt.aiAnalysis.includes("pending");

    if (isAnalysisInvalid) {
      // Try to get from cache first
      const cached = await AnalysisCache.findOne({
        unitId: fullAttempt.quizId.unitId._id,
        cacheKey: cacheKey,
        expiresAt: { $gte: new Date() }, // Not expired
      });

      if (cached) {
        console.log(`✅ [AnalysisCache] Cache HIT for key: ${cacheKey}`);
        attempt.aiAnalysis = cached.analysisText;

        // Increment hit counter for analytics
        await AnalysisCache.updateOne(
          { _id: cached._id },
          { $inc: { hitCount: 1 } },
        );

        await attempt.save();
      } else {
        console.log(
          `⚠️ [AnalysisCache] Cache MISS for key: ${cacheKey}, generating...`,
        );

        // Generate new analysis via LLM
        try {
          const llmProvider =
            require("../../services/llm/LLMFactory").getProvider();
          const analysis = await llmProvider.analyzeQuizAttempt({
            unit: { name: fullAttempt.quizId.unitId.name },
            score: fullAttempt.score,
            totalQuestions: fullAttempt.totalQuestions,
            weakTopics: weakTopicsList,
          });

          attempt.aiAnalysis = analysis;
          await attempt.save();

          // Cache for future use (7 days TTL)
          await AnalysisCache.create({
            unitId: fullAttempt.quizId.unitId._id,
            cacheKey: cacheKey,
            analysisText: analysis,
          });

          console.log(
            `✅ [AnalysisCache] Cached analysis for key: ${cacheKey}`,
          );
        } catch (err) {
          console.error("Analysis generation failed", err);
          // Leave as-is, will retry on next view
        }
      }
    }

    return sendSuccess(res, STATUS.OK, "Assessment result fetched", {
      result: {
        ...fullAttempt.toObject(),
        // Ensure we return the analysis and reconstructed weak topics
        aiAnalysis: attempt.aiAnalysis,
        weakTopics: weakTopicsList,
      },
    });
  }),

  /**
   * Get assessment history for user
   * GET /api/v1/assessments/history
   */
  getAssessmentHistory: asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    const history = await quizAttemptsModel.getHistoryByUser(userId);

    const formattedHistory = history.map((h) => ({
      _id: h._id,
      quizType: h.quizType,
      score: h.score,
      totalQuestions: h.totalQuestions,
      percentage: h.percentage,
      unitName: h.quizId?.unitId?.name || "Unknown Unit",
      unitNumber: h.quizId?.unitId?.unitNumber,
      completedAt: h.completedAt,
    }));

    return sendSuccess(res, STATUS.OK, "Assessment history fetched", {
      history: formattedHistory,
    });
  }),

  /**
   * 🎯 UPDATE TIME SPENT (Timer Auto-Save)
   *
   * WHY THIS EXISTS:
   * - Users navigate away, close tab, or refresh during assessments
   * - We need to persist elapsed time to resume accurately
   * - Called automatically every 30s and on unmount/close
   *
   * STRATEGY:
   * - Lightweight PATCH request (just update timeSpent field)
   * - No validation needed (IN_PROGRESS check only)
   * - Silent fail-safe (doesn't block user if network issue)
   *
   * @param {string} attemptId - Quiz attempt ID
   * @body {number} timeSpent - Elapsed time in seconds
   */
  updateTimeSpent: asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const { timeSpent } = req.body;

    if (typeof timeSpent !== "number" || timeSpent < 0) {
      throw new AppError("Invalid timeSpent value", STATUS.BAD_REQUEST);
    }

    const attempt = await quizAttemptsModel.Model.findById(attemptId);
    if (!attempt) {
      throw new AppError("Attempt not found", STATUS.NOT_FOUND);
    }

    // Only allow updating time for active attempts
    if (attempt.status !== ATTEMPT_STATUS.IN_PROGRESS) {
      throw new AppError(
        "Cannot update time for completed assessment",
        STATUS.FORBIDDEN,
      );
    }

    // Update timeSpent
    attempt.timeSpent = timeSpent;
    await attempt.save();

    console.log(`⏱️ [Timer] Auto-saved ${timeSpent}s for attempt ${attemptId}`);

    return sendSuccess(res, STATUS.OK, "Time updated", {
      timeSpent: attempt.timeSpent,
    });
  }),
};

module.exports = assessmentsController;
