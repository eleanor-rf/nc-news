const db = require("../db/connection");

exports.deleteComment = (commentId) => {
  return db
    .query("DELETE FROM comments WHERE comment_id = $1", [commentId])
    .then((result) => {
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
