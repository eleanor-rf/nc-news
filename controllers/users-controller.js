const { selectUsers } = require("../models/users");

exports.getUsers = (request, response, next) => {
  return selectUsers()
    .then((users) => {
      response.status(200).send({ users });
    })
    .catch((error) => {
      next(error);
    });
};
