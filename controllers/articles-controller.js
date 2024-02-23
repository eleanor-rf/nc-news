const {
  selectArticleById,
  selectArticles,
  selectCommentsByArticleId,
  insertComment,
  updateArticle,
  insertArticle,
  deleteArticle,
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
  const { topic, sort_by, order, limit, p } = request.query;
  return selectArticles(topic, sort_by, order, limit, p)
    .then((articles) => {
      response.status(200).send({ articles });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getCommentsByArticleId = (request, response, next) => {
  const articleId = request.params.article_id;
  const { limit, p } = request.query;
  return selectCommentsByArticleId(articleId, limit, p)
    .then((comments) => {
      response.status(200).send({ comments });
    })
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

exports.postArticle = (request, response, next) => {
  const { author, title, body, topic, article_img_url } = request.body;

  return insertArticle(author, title, body, topic, article_img_url)
    .then((article) => {
      response.status(201).send({ article: { comment_count: 0, ...article } });
    })
    .catch((error) => {
      next(error);
    });
};

exports.removeArticle = (request, response, next) => {
  const articleId = request.params.article_id;
  return deleteArticle(articleId)
    .then((success) => {
      response.status(204).send();
    })
    .catch((error) => {
      next(error);
    });
};

 