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
     * LAZY ANALYSIS GENERATION WITH VERSION-SPECIFIC CACHE
     *
     * WHY VERSION-SPECIFIC:
     * - Cache key is now: analysis:{attemptId}:v{version}
     * - Each attempt + version combination gets isolated cache
     * - No cross-student cache sharing
     *
     * IMPACT: Reduces LLM calls while maintaining per-student isolation
     */
    const { AnalysisCache } = require("../../schemas/AnalysisCache");

    // Check if analysis is missing OR invalid
    const isAnalysisInvalid =
      !attempt.aiAnalysis ||
      attempt.aiAnalysis.includes("Unable to generate") ||
      attempt.aiAnalysis.includes("pending");

    if (isAnalysisInvalid) {
      // Determine next version (for initial analysis, this is v1)
      const nextVersion = (attempt.analysisAttempts || 0) + 1;

      // Try cache lookup with version-specific key
      const cached = await AnalysisCache.findOne({
        attemptId: attempt._id,
        analysisVersion: nextVersion,
        expiresAt: { $gte: new Date() },
      });

      if (cached) {
        console.log(
          `✅ [AnalysisCache] Cache HIT for attempt:${attempt._id} v${nextVersion}`,
        );
        attempt.aiAnalysis = cached.analysisText;

        // Initialize analysis log
        if (!attempt.analysisLog) {
          attempt.analysisLog = [];
        }
        attempt.analysisLog.push({
          date: cached.generatedAt,
          version: nextVersion,
          analysisText: cached.analysisText,
        });
        attempt.analysisAttempts = nextVersion;

        await attempt.save();
      } else {
        console.log(
          `⚠️ [AnalysisCache] Cache MISS for attempt:${attempt._id} v${nextVersion}, generating...`,
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
            analysisVersion: nextVersion, // NEW: Informs LLM of version
          });

          attempt.aiAnalysis = analysis;

          // Initialize analysis log
          if (!attempt.analysisLog) {
            attempt.analysisLog = [];
          }
          attempt.analysisLog.push({
            date: new Date(),
            version: nextVersion,
            analysisText: analysis,
          });
          attempt.analysisAttempts = nextVersion;

          await attempt.save();

          // Store in version-specific cache (append-only)
          await AnalysisCache.create({
            attemptId: attempt._id,
            analysisVersion: nextVersion,
            unitId: fullAttempt.quizId.unitId._id,
            analysisText: analysis,
            generatedAt: new Date(),
          });

          console.log(
            `✅ [AnalysisCache] Cached analysis for attempt:${attempt._id} v${nextVersion}`,
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
        analysisAttempts: attempt.analysisAttempts || 0,
        analysisLog: attempt.analysisLog || [],
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

  /**
   * Re-analyze assessment result (Max 2 attempts)
   * POST /api/v1/assessments/:attemptId/analyze
   *
   * CRITICAL REQUIREMENTS:
   * 1. Race-safe limit enforcement (no concurrent bypass)
   * 2. Version-specific cache lookup before generation
   * 3. Append-only cache storage (no overwrites)
   * 4. AI variation via versioned prompts
   */
  reanalyzeAssessment: asyncHandler(async (req, res) => {
    const { attemptId } = req.params;
    const userId = req.user.userId || req.user._id;

    // STEP 1: RACE-SAFE LIMIT CHECK
    // Use findOneAndUpdate to atomically check + increment
    // This prevents concurrent requests from both passing the limit check
    const attemptBeforeUpdate = await quizAttemptsModel.Model.findOneAndUpdate(
      {
        _id: attemptId,
        userId: userId,
        analysisAttempts: { $lt: 2 }, // CRITICAL: Only proceed if < 2
      },
      {
        $inc: { analysisAttempts: 1 }, // Reserve the slot
      },
      {
        new: false, // Return document BEFORE increment
      },
    );

    if (!attemptBeforeUpdate) {
      // Either: (a) attempt not found, (b) wrong user, or (c) limit reached
      // Check which case to provide proper error
      const existingAttempt = await quizAttemptsModel.getAttemptById(attemptId);
      if (!existingAttempt) {
        throw new AppError("Assessment attempt not found", STATUS.NOT_FOUND);
      }
      if (existingAttempt.userId.toString() !== userId.toString()) {
        throw new AppError("Unauthorized access", STATUS.FORBIDDEN);
      }
      // Rollback the increment (if it happened due to race)
      await quizAttemptsModel.Model.updateOne(
        { _id: attemptId },
        { $set: { analysisAttempts: 2 } }, // Ensure it stays at 2
      );
      throw new AppError(
        "Maximum re-analysis attempts reached",
        STATUS.FORBIDDEN,
      );
    }

    const nextVersion = (attemptBeforeUpdate.analysisAttempts || 0) + 1;

    // STEP 2: FETCH FULL DETAILS
    const fullAttempt = await quizAttemptsModel.Model.findById(attemptId)
      .populate({
        path: "answers.questionId",
        populate: { path: "topicId" },
      })
      .populate({
        path: "quizId",
        populate: { path: "unitId" },
      });

    // Build weak topics list
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

    // STEP 3: CACHE LOOKUP (Version-specific)
    const { AnalysisCache } = require("../../schemas/AnalysisCache");
    const cached = await AnalysisCache.findOne({
      attemptId: attemptId,
      analysisVersion: nextVersion,
      expiresAt: { $gte: new Date() },
    });

    let analysis;

    if (cached) {
      console.log(
        `✅ [AnalysisCache] Cache HIT for re-analysis attempt:${attemptId} v${nextVersion}`,
      );
      analysis = cached.analysisText;
    } else {
      // STEP 4: GENERATE WITH AI VARIATION
      console.log(
        `⚠️ [AnalysisCache] Cache MISS for attempt:${attemptId} v${nextVersion}, generating...`,
      );

      const llmProvider =
        require("../../services/llm/LLMFactory").getProvider();
      analysis = await llmProvider.analyzeQuizAttempt({
        unit: { name: fullAttempt.quizId.unitId.name },
        score: fullAttempt.score,
        totalQuestions: fullAttempt.totalQuestions,
        weakTopics: weakTopicsList,
        analysisVersion: nextVersion, // CRITICAL: Forces variation
        previousAnalysis: attemptBeforeUpdate.aiAnalysis, // Avoid repetition
      });

      // STEP 5: STORE IN CACHE (Append-only, immutable)
      await AnalysisCache.create({
        attemptId: attemptId,
        analysisVersion: nextVersion,
        unitId: fullAttempt.quizId.unitId._id,
        analysisText: analysis,
        generatedAt: new Date(),
      });

      console.log(
        `✅ [AnalysisCache] Cached re-analysis for attempt:${attemptId} v${nextVersion}`,
      );
    }

    // STEP 6: FINALIZE (Update attempt with new analysis)
    const updatedAttempt = await quizAttemptsModel.getAttemptById(attemptId);
    updatedAttempt.aiAnalysis = analysis;

    if (!updatedAttempt.analysisLog) {
      updatedAttempt.analysisLog = [];
    }
    updatedAttempt.analysisLog.push({
      date: new Date(),
      version: nextVersion,
      analysisText: analysis,
    });

    await updatedAttempt.save();

    return sendSuccess(res, STATUS.OK, "Assessment re-analyzed successfully", {
      result: {
        aiAnalysis: updatedAttempt.aiAnalysis,
        analysisAttempts: updatedAttempt.analysisAttempts,
        analysisLog: updatedAttempt.analysisLog,
      },
    });
  }),
};

module.exports = assessmentsController;
