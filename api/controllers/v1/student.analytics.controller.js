const asyncHandler = require("../../utils/asyncHandler");
const { sendSuccess } = require("../../utils/responses/ApiResponse");
const STATUS = require("../../utils/status");
const quizAttemptsModel = require("../../models/quizAttempts.model");
const mongoose = require("mongoose");

const studentAnalyticsController = {
  /**
   * Get dashboard summary stats (Streak, Time spent, Avg Score)
   * GET /api/v1/analytics/dashboard
   */
  getDashboardStats: asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    console.log(`[Analytics] DashboardStats - User: ${userId}`, req.user);

    // 1. Calculate Streak & Consistency
    // This is a simplified streak calculation based on daily activity
    const activityData = await quizAttemptsModel.Model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "SUBMITTED",
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          count: { $sum: 1 },
          avgScore: { $avg: "$score" },
          totalTime: { $sum: "$timeSpent" },
        },
      },
      { $sort: { _id: -1 } },
    ]);
    console.log(`[Analytics] Activity Data Length: ${activityData.length}`);

    // 2. Calculate Total Study Time (in hours)
    const totalSeconds = activityData.reduce(
      (acc, cur) => acc + cur.totalTime,
      0,
    );
    const totalHours = (totalSeconds / 3600).toFixed(1);

    // 3. Average Score (Overall)
    const totalAvgScore =
      activityData.length > 0
        ? (
            activityData.reduce((acc, cur) => acc + cur.avgScore, 0) /
            activityData.length
          ).toFixed(1)
        : 0;

    // 4. Calculate Streak
    let streak = 0;
    const today = new Date().toISOString().split("T")[0];
    const yesterday = new Date(Date.now() - 86400000)
      .toISOString()
      .split("T")[0];

    // Check if user active today
    if (
      activityData.length > 0 &&
      (activityData[0]._id === today || activityData[0]._id === yesterday)
    ) {
      streak = 1;
      let checkDate = new Date(activityData[0]._id);

      for (let i = 1; i < activityData.length; i++) {
        checkDate.setDate(checkDate.getDate() - 1);
        const expectedDate = checkDate.toISOString().split("T")[0];

        if (activityData[i]._id === expectedDate) {
          streak++;
        } else {
          break;
        }
      }
    }

    return sendSuccess(res, STATUS.OK, "Dashboard stats fetched", {
      stats: {
        currentStreak: streak,
        totalHoursStudy: totalHours,
        averageScore: totalAvgScore,
        totalAssessments: activityData.reduce((acc, cur) => acc + cur.count, 0),
        activityHeatmap: activityData.reduce((acc, val) => {
          acc[val._id] = val.count;
          return acc;
        }, {}),
      },
    });
  }),

  /**
   * Get Performance Trends (Score history)
   * GET /api/v1/analytics/performance
   */
  getPerformanceTrends: asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    const { range = "30d" } = req.query; // 7d, 30d, 90d
    console.log(
      `[Analytics] PerformanceTrends - User: ${userId}, Range: ${range}`,
    );

    let dateLimit = new Date();
    if (range === "7d") dateLimit.setDate(dateLimit.getDate() - 7);
    else if (range === "90d") dateLimit.setDate(dateLimit.getDate() - 90);
    else dateLimit.setDate(dateLimit.getDate() - 30); // Default 30d

    const attempts = await quizAttemptsModel.Model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "SUBMITTED",
          completedAt: { $gte: dateLimit },
        },
      },
      {
        $lookup: {
          from: "quizzes",
          localField: "quizId",
          foreignField: "_id",
          as: "quiz",
        },
      },
      { $unwind: "$quiz" },
      {
        $lookup: {
          from: "units",
          localField: "quiz.unitId",
          foreignField: "_id",
          as: "unit",
        },
      },
      { $unwind: "$unit" },
      {
        $project: {
          date: { $dateToString: { format: "%Y-%m-%d", date: "$completedAt" } },
          score: 1,
          unitName: "$unit.name",
        },
      },
    ]);

    return sendSuccess(res, STATUS.OK, "Performance stats fetched", {
      trends: attempts,
    });
  }),

  /**
   * Get Topic Mastery (Aggregated weak/strong areas)
   * GET /api/v1/analytics/topics
   */
  getTopicMastery: asyncHandler(async (req, res) => {
    const userId = req.user.userId || req.user._id;
    console.log(`[Analytics] TopicMastery - User: ${userId}`);

    // Determine mastery based on question attempts
    // This requires detailed aggregation on QuestionAttempt collection if it exists,
    // or un-winding the `answers` array in QuizAttempt.

    const topicStats = await quizAttemptsModel.Model.aggregate([
      {
        $match: {
          userId: new mongoose.Types.ObjectId(userId),
          status: "SUBMITTED",
        },
      },
      { $unwind: "$answers" },
      {
        $lookup: {
          from: "questions",
          localField: "answers.questionId",
          foreignField: "_id",
          as: "questionDetails",
        },
      },
      { $unwind: "$questionDetails" },
      {
        $lookup: {
          from: "topics",
          localField: "questionDetails.topicId",
          foreignField: "_id",
          as: "topicDetails",
        },
      },
      { $unwind: "$topicDetails" },
      {
        $group: {
          _id: "$topicDetails.name",
          totalQuestions: { $sum: 1 },
          correctAnswers: { $sum: { $cond: ["$answers.isCorrect", 1, 0] } },
        },
      },
      {
        $project: {
          topic: "$_id",
          mastery: {
            $round: [
              {
                $multiply: [
                  { $divide: ["$correctAnswers", "$totalQuestions"] },
                  100,
                ],
              },
              0,
            ],
          },
          totalQuestions: 1,
        },
      },
      { $sort: { mastery: 1 } }, // Weakest first
      { $limit: 10 },
    ]);

    console.log(`[Analytics] TopicMastery Count: ${topicStats.length}`);
    return sendSuccess(res, STATUS.OK, "Topic mastery fetched", {
      topics: topicStats,
    });
  }),
};

module.exports = studentAnalyticsController;
