const getRouter = require("../../utils/getRouter");
const usersRouter = require("./v1Routes/usersRouter");
const resourcesRouter = require("./v1Routes/resourcesRouter");

const v1Router = getRouter();

v1Router.use("/users", usersRouter);
v1Router.use("/resources", resourcesRouter);

module.exports = v1Router;
