const getRouter = require("../../../utils/getRouter");
const resourcesController = require("../../../controllers/v1/resourcesController");

const resourcesRouter = getRouter();

resourcesRouter.get("/branches", resourcesController.getBranches);

module.exports = resourcesRouter;
