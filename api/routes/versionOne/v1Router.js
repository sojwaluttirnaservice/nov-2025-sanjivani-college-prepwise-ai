const getRouter = require("../../utils/getRouter");
const usersRouter = require("./v1Routes/usersRouter");

const v1Router = getRouter();

v1Router.use("/users", usersRouter);

module.exports = v1Router;
