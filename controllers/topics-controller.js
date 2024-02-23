const { selectTopics, insertTopic } = require("../models/topics");

exports.getTopics = (request, response, next) => {
  return selectTopics()
    .then((topics) => {
      response.status(200).send({ topics });
    })
    .catch((error) => {
      next(error);
    });
};

exports.postTopic = (request, response, next) => {
  const { slug, description } = request.body;
  return insertTopic(slug, description)
    .then((topic) => {
      response.status(201).send({ topic });
    })
    .catch((error) => {
      next(error);
    });
};
