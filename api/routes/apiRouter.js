const getRouter = require("../utils/getRouter");
const v1Router = require("./versionOne/v1Router");

const apiRouter = getRouter();

apiRouter.get('/', (req, res) => {
    console.log(req.ip)
    return res.json({
        success: true,
        message: '🚀 Server is up and running smoothly! Ready to handle your requests. ✅'
    });
});

// Version 1
apiRouter.use('/api/v1', v1Router)


module.exports = apiRouter