const { deleteComment, updateComment } = require("../models/comments");

exports.removeComment = (request, response, next) => {
  const commentId = request.params.comment_id;
  return deleteComment(commentId)
    .then((comment) => {
      response.status(204).send();
    })
    .catch((error) => {
      next(error);
    });
};

exports.patchComment = (request, response, next) => {
  const newVote = request.body.inc_votes;
  const commentId = request.params.comment_id;
  return updateComment(commentId, newVote)
    .then((comment) => {
      response.status(200).send({ comment });
    })
    .catch((error) => {
      next(error);
    });
};
