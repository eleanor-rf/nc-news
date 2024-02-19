const express = require("express");
const app = express();
const { getTopics } = require("./controllers/topics-controller");
const { getArticleById } = require("./controllers/articles-controller");
const { fetchEndpoints } = require("./controllers/endpoints-controller");
const {
  handlePSQLErrors,
  handleCustomErrors,
  handle500Errors,
} = require("./controllers/errors-controller.js");

app.get("/api/topics", getTopics);

app.get("/api", fetchEndpoints);

app.get("/api/articles/:article_id", getArticleById)

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
