const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const fs = require("fs/promises");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("GET /api/topics", () => {
  it("should get all topics", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then((response) => {
        const topics = response.body.topics;
        expect(topics.length).toBe(3);
        topics.forEach((entry) => {
          expect(typeof entry.slug).toBe("string");
          expect(typeof entry.description).toBe("string");
        });
      });
  });
});

function readEndpointsFile() {
  return fs.readFile("./endpoints.json", "utf8").then((data) => {
    const endpoints = JSON.parse(data);
    return endpoints;
  });
}

describe("GET /api/endpoints", () => {
  it("should return an object", () => {
    return request(app)
      .get("/api")
      .then((response) => {
        return readEndpointsFile().then((expectedData) => {
          expect(response.status).toBe(200);
          expect(response.body.endpoints).toEqual(expectedData);
        });
      });
  });
});
