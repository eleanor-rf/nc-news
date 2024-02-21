const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
} = require("../models/articles");

exports.getArticleById = (request, response, next) => {
  const articleId = request.params.article_id;
  return selectArticleById(articleId)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getArticles = (request, response, next) => {
  const topic = request.query.topic;
  return selectArticles(topic)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getCommentsByArticleId = (request, response, next) => {
  const articleId = request.params.article_id;
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

exports.patchArticle = (request, response, next) => {
  const newVote = request.body.inc_votes;
  const articleId = request.params.article_id;
  return updateArticle(articleId, newVote)
    .then((article) => {
      response.status(200).send({ article });
    })
    .catch((error) => {
      next(error);
    });
};
