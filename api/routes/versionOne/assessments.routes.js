const express = require("express");
const assessmentsRouter = express.Router();
const assessmentsController = require("../../controllers/v1/assessmentsController");
const { isStudent } = require("../../middlewares/auth");

/**
 * @route   POST /api/v1/assessments/:unitId/start
 * @desc    Start an assessment (Diagnostic or Adaptive)
 * @access  Private (Student)
 */
assessmentsRouter.post(
  "/:unitId/start",
  isStudent,
  assessmentsController.startAssessment,
);

/**
 * @route   GET /api/v1/assessments/history
 * @desc    Get all submitted assessments
 * @access  Private (Student)
 */
assessmentsRouter.get(
  "/history",
  isStudent,
  assessmentsController.getAssessmentHistory,
);

/**
 * @route   POST /api/v1/assessments/:attemptId/submit
 * @desc    Submit assessment answers
 * @access  Private (Student)
 */
assessmentsRouter.post(
  "/:attemptId/submit",
  isStudent,
  assessmentsController.submitAssessment,
);

/**
 * @route   PATCH /api/v1/assessments/:attemptId/time
 * @desc    Update elapsed time for active assessment (auto-save)
 * @access  Private (Student)
 */
assessmentsRouter.patch(
  "/:attemptId/time",
  isStudent,
  assessmentsController.updateTimeSpent,
);

/**
 * @route   GET /api/v1/assessments/:attemptId/result
 * @desc    Get specific assessment result with analysis
 * @access  Private (Student)
 */
assessmentsRouter.get(
  "/:attemptId/result",
  isStudent,
  assessmentsController.getAssessmentResult,
);

module.exports = assessmentsRouter;
