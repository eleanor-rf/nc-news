const db = require("../db/connection");

exports.selectTopics = () => {
  return db.query(`SELECT * FROM topics`).then((data) => {
    return data.rows;
  });
};

exports.insertTopic = (slug, description) => {
  const params = [slug, description];
  if (!slug || !description || typeof slug !== "string" || typeof description !== "string") {
    return Promise.reject({ status: 400, msg: "Bad request" });
  }

  return db
    .query(
      "INSERT INTO topics(slug, description) VALUES($1, $2) RETURNING *",
      params
    )
    .then((data) => {
      return data.rows[0];
    });
};
