const articlesRouter = require("express").Router();
const {
  getArticleById,
  getArticles,
  getCommentsByArticleId,
  addComment,
  patchArticle,
} = require("../controllers/articles-controller");

articlesRouter.get("/", getArticles);

articlesRouter.route("/:article_id").get(getArticleById).patch(patchArticle);

articlesRouter
  .route("/:article_id/comments")
  .get(getCommentsByArticleId)
  .post(addComment);

module.exports = articlesRouter;
