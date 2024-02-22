const commentsRouter = require("express").Router();
const { removeComment } = require("../controllers/comments-controller");

commentsRouter.delete("/:comment_id", removeComment);

module.exports = commentsRouter;
