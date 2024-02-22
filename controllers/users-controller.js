const { selectUsers, selectUserByUsername } = require("../models/users");

exports.getUsers = (request, response, next) => {
  return selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((error) => {
      next(error);
    });
};

exports.getUserByUsername = (request, response, next) => {
  const username = request.params.username;
  return selectUserByUsername(username)
    .then((user) => {
      response.status(200).send({ user });
    })
    .catch((error) => {
      next(error);
    });
};
