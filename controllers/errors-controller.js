exports.handlePSQLErrors = (err, request, response, next) => {
  if (err.code === "22003" || err.code === "23503") {
    response.status(404).send({ msg: "Not found" });
  } else if (err.code === "23502" || err.code === "22P02") {
    response.status(400).send({ msg: "Bad request" });
  } else {
    next(err);
  }
};

exports.handleCustomErrors = (err, request, response, next) => {
  if (err.status && err.msg) {
    response.status(err.status).send({ msg: err.msg });
  }
};

exports.handle500Errors = (err, request, response, next) => {
  response.status(500).send({ msg: "Internal server error" });
};
