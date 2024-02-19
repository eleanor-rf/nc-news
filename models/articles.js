const db = require("../db/connection");

exports.selectArticleById = (articleId) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [articleId])
    .then((response) => {
      return response.rows[0];
    });
};
