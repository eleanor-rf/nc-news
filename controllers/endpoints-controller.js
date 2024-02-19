const { fetchEndpoints } = require("../models/endpoints");

exports.fetchEndpoints = (request, response, next) => {
  fetchEndpoints()
    .then((endpoints) => {
      response.status(200).send({ endpoints });
    })
    .catch((error) => {
      next(error);
    });
};
