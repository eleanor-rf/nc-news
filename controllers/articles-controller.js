const { selectArticleById, selectArticles } = require("../models/articles");

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
