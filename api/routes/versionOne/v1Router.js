const getRouter = require("../../utils/getRouter");
const usersRouter = require("./v1Routes/usersRouter");
const resourcesRouter = require("./v1Routes/resourcesRouter");

const v1Router = getRouter();

v1Router.use("/users", usersRouter);
v1Router.use("/resources", resourcesRouter);
v1Router.use("/assessments", require("./assessments.routes"));
v1Router.use("/admin", require("./v1Routes/adminRouter"));

// Analytics Routes
const analyticsRouter = getRouter();
const analyticsController = require("../../controllers/v1/student.analytics.controller");
const { isAuthenticated } = require("../../middlewares/auth");

analyticsRouter.use(isAuthenticated);
analyticsRouter.get("/dashboard", analyticsController.getDashboardStats);
analyticsRouter.get("/performance", analyticsController.getPerformanceTrends);
analyticsRouter.get("/topics", analyticsController.getTopicMastery);

// Study Notes Routes
const notesController = require("../../controllers/v1/student.notes.controller");
analyticsRouter.get("/notes", notesController.getNotesHistory);
analyticsRouter.post("/notes/generate", notesController.generateNotes);

v1Router.use("/analytics", analyticsRouter);

module.exports = v1Router;
