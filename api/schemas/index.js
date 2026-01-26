const fs = require("fs");
const path = require("path");

const models = {};

fs.readdirSync(__dirname)
  .filter((file) => {
    return (
      file.indexOf(".") !== 0 && // ignore hidden files
      file !== "index.js" && // ignore this file
      file.slice(-3) === ".js" // only js files
    );
  })
  .forEach((file) => {
    const model = require(path.join(__dirname, file));
    // If the file exports a model (which it should), we can optionally store it in 'models' object
    // But the main purpose here is just to execute the 'require' so mongoose registers the model.
    if (model.modelName) {
      models[model.modelName] = model;
    }
  });

module.exports = models;
