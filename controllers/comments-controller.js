const { deleteComment } = require("../models/comments");

exports.removeComment = (request, response, next) => {
  const commentId = request.params.comment_id;
  return deleteComment(commentId)
    .then((comment) => {
      if (comment.rowCount === 0) {
        return Promise.reject({
          status: 404,
          msg: "Not found",
        });
      }
      response.status(204).send();
    })
    .catch((error) => {
      next(error);
    });
};
