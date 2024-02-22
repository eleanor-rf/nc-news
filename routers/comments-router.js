const commentsRouter = require("express").Router();
const {
  removeComment,
  patchComment,
} = require("../controllers/comments-controller");

commentsRouter.route("/:comment_id").delete(removeComment).patch(patchComment);

module.exports = commentsRouter;
