const db = require("../db/connection");

exports.selectArticleById = (articleId) => {
  return db
    .query("SELECT * FROM articles WHERE article_id = $1", [articleId])
    .then((response) => {
      return response.rows[0];
    });
};

exports.selectArticles = () => {
  return db
    .query(
      "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count FROM comments RIGHT JOIN articles ON comments.article_id = articles.article_id GROUP BY articles.article_id ORDER BY articles.created_at DESC"
    )
    .then((articles) => {
      return articles.rows;
    });
};

exports.selectCommentsByArticleId = (articleId) => {
  return db
    .query("SELECT * FROM comments WHERE article_id = $1", [articleId])
    .then((comments) => {
      return comments.rows;
    });
};

exports.insertComment = (articleId, username, body) => {
  const params = [articleId, username, body];
  return db
    .query(
      "INSERT INTO comments(article_id, author, body) VALUES($1, $2, $3) RETURNING *",
      params
    )
    .then((comment) => {
      return comment.rows[0];
    });
};

exports.updateArticle = (articleId, newVote) => {
  const params = [newVote, articleId];

  return db
    .query(
      "UPDATE articles SET votes = votes + $1 WHERE article_id = $2 RETURNING *",
      params
    )
    .then((article) => {
      return article.rows[0];
    });
};
