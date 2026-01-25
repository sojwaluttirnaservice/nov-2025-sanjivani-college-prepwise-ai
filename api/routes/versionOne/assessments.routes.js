const express = require("express");
const router = express.Router();
const assessmentsController = require("../../controllers/v1/assessmentsController");

/**
 * @route   POST /api/v1/assessments/:unitId/start
 * @desc    Start an assessment (Diagnostic or Adaptive)
 * @access  Private (Student)
 */
router.post("/:unitId/start", assessmentsController.startAssessment);

/**
 * @route   POST /api/v1/assessments/:attemptId/submit
 * @desc    Submit assessment answers
 * @access  Private (Student)
 */
router.post("/:attemptId/submit", assessmentsController.submitAssessment);

module.exports = router;
