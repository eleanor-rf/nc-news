const express = require("express");
const app = express();
const topicsRouter = require("./routers/topics-router");
const articlesRouter = require("./routers/articles-router");
const commentsRouter = require("./routers/comments-router");
const usersRouter = require("./routers/users-router");
const endpointsRouter = require("./routers/endpoints-router");
const {
  handlePSQLErrors,
  handleCustomErrors,
  handle500Errors,
} = require("./controllers/errors-controller.js");
app.use(express.json());
const cors = require("cors");

app.use(cors());

app.use("/api/topics", topicsRouter);
app.use("/api/articles", articlesRouter);
app.use("/api/comments", commentsRouter);
app.use("/api/users", usersRouter);
app.use("/api", endpointsRouter);

app.use(handlePSQLErrors);
app.use(handleCustomErrors);
app.use(handle500Errors);

module.exports = app;
