const db = require("../db/connection");

exports.deleteComment = (commentId) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1", [commentId])
    .then((result) => {
      if (result.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not found",
        });
      }
      return result;
    });
};

exports.updateComment = (commentId, newVote) => {
  const params = [newVote, commentId];

  return db
    .query(
      "UPDATE comments SET votes = votes + $1 WHERE comment_id = $2 RETURNING *",
      params
    )
    .then((comment) => {
      return comment.rows[0];
    });
};
