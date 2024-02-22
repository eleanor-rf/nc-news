const endpointsRouter = require("express").Router();
const { fetchEndpoints } = require("../controllers/endpoints-controller");

endpointsRouter.get("/", fetchEndpoints);

module.exports = endpointsRouter;
