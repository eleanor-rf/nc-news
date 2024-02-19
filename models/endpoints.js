const fs = require("fs/promises");

exports.fetchEndpoints = () => {
  return fs.readFile("./endpoints.json", "utf8").then((data) => {
    const endpoints = JSON.parse(data);
    return endpoints;
  });
};
