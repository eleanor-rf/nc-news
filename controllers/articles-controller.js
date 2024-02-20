const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
} = require("../models/articles");

exports.getArticleById = (request, response, next) => {
  const articleId = request.params.article_id * 1;
  return selectArticleById(articleId)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getArticles = (request, response, next) => {
  return selectArticles()
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getCommentsByArticleId = (request, response, next) => {
  const articleId = request.params.article_id * 1;
  return selectCommentsByArticleId(articleId)
    .then((comments) => response.status(200).send({ comments }))
    .catch((error) => {
      next(error);
    });
};

exports.addComment = (request, response, next) => {
  const { username, body } = request.body;
  const articleId = request.params.article_id;
  return insertComment(articleId, username, body)
    .then((comment) => {
      response.status(201).send({ comment });
    })
    .catch((error) => {
      next(error);
    });
};
