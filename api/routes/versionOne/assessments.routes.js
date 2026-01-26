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
 * @route   POST /api/v1/assessments/:attemptId/submit
 * @desc    Submit assessment answers
 * @access  Private (Student)
 */
assessmentsRouter.post(
  "/:attemptId/submit",
  isStudent,
  assessmentsController.submitAssessment,
);

module.exports = assessmentsRouter;
