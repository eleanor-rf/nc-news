const db = require("../db/connection");
const format = require("pg-format");

exports.selectArticleById = (articleId) => {
  return db
    .query(
      "SELECT articles.*, CAST(COUNT(comments.comment_id) AS INT) AS comment_count FROM articles LEFT JOIN comments ON articles.article_id = comments.article_id WHERE articles.article_id = $1 GROUP BY articles.article_id",
      [articleId]
    )
    .then((response) => {
      return response.rows[0];
    });
};

const checkExists = (table, column, value) => {
  const queryString = format("SELECT * FROM %I WHERE %I = $1;", table, column);
  return db.query(queryString, [value]).then((result) => {
    if (result.rows.length === 0) {
      return Promise.reject({ status: 404, msg: "Not found" });
    }
  });
};

exports.selectArticles = (
  topic,
  sort_by = "created_at",
  order = "desc",
  limit = 10,
  p = 1
) => {
  const queryValues = [];
  let queryString =
    "SELECT articles.author, articles.title, articles.article_id, articles.topic, articles.created_at, articles.votes, articles.article_img_url, CAST(COUNT(comments.comment_id) AS INT) AS comment_count FROM comments RIGHT JOIN articles ON comments.article_id = articles.article_id";

  if (topic !== undefined) {
    queryString += " WHERE articles.topic = $1";
    queryValues.push(topic);
  }

  if (!["title", "topic", "author", "votes", "created_at"].includes(sort_by)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  if (!["asc", "desc"].includes(order)) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  const lim = parseInt(limit);
  const page = parseInt(p);

  if (isNaN(lim) || isNaN(page) || limit <= 0 || page <= 0) {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  queryString += ` GROUP BY articles.article_id ORDER BY articles.${sort_by} ${order}, articles.article_id LIMIT ${lim} OFFSET ${
    limit * (page - 1)
  };`;

  return db.query(queryString, queryValues).then((articles) => {
    if (!articles.rows.length) {
      return checkExists("topics", "slug", topic).then((itExists) => {
        return articles.rows;
      });
    } else {
      return articles.rows;
    }
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

exports.insertArticle = (author, title, body, topic, article_img_url) => {
  const params = [author, title, body, topic];
  let queryString =
    "INSERT INTO articles(author, title, body, topic) VALUES($1, $2, $3, $4) RETURNING *";

  if (article_img_url !== undefined) {
    params.push(article_img_url);
    queryString =
      "INSERT INTO articles(author, title, body, topic, article_img_url) VALUES($1, $2, $3, $4, $5) RETURNING *";
  }

  return db.query(queryString, params).then((article) => {
    return article.rows[0];
  });
};
