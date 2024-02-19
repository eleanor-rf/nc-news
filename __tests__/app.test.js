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

describe("GET /api/articles/:article_id", () => {
  it("should return requested article", () => {
    const expected = {
      article_id: 2,
      title: "Sony Vaio; or, The Laptop",
      topic: "mitch",
      author: "icellusedkars",
      body: "Call me Mitchell. Some years ago—never mind how long precisely—having little or no money in my purse, and nothing particular to interest me on shore, I thought I would buy a laptop about a little and see the codey part of the world. It is a way I have of driving off the spleen and regulating the circulation. Whenever I find myself growing grim about the mouth; whenever it is a damp, drizzly November in my soul; whenever I find myself involuntarily pausing before coffin warehouses, and bringing up the rear of every funeral I meet; and especially whenever my hypos get such an upper hand of me, that it requires a strong moral principle to prevent me from deliberately stepping into the street, and methodically knocking people’s hats off—then, I account it high time to get to coding as soon as I can. This is my substitute for pistol and ball. With a philosophical flourish Cato throws himself upon his sword; I quietly take to the laptop. There is nothing surprising in this. If they but knew it, almost all men in their degree, some time or other, cherish very nearly the same feelings towards the the Vaio with me.",
      created_at: "2020-10-16T05:03:00.000Z",
      votes: 0,
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .get("/api/articles/2")
      .expect(200)
      .then((response) => {
        expect(response.body.article).toEqual(expected);
      });
  });
  it("should 404 not found if requesting a non existent article", () => {
    return request(app)
      .get("/api/articles/4354574566575645")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
  it("should 400 bad request if requesting anything other than an integer for article id", () => {
    return request(app)
      .get("/api/articles/forklift")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe.only("GET /api/articles", () => {
  it("should get all articles with comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        console.log(articles);
        expect(articles.length).toBe(13);
        articles.forEach((entry) => {
          expect(typeof entry.author).toBe("string");
          expect(typeof entry.title).toBe("string");
          expect(typeof entry.topic).toBe("string");
          expect(typeof entry.article_img_url).toBe("string");
          expect(typeof entry.created_at).toBe("string");
          expect(typeof entry.article_id).toBe("number");
          expect(typeof entry.votes).toBe("number");
          expect(typeof entry.comment_count).toBe("number");
        });
      });
  });
  it("should return articles sorted by date descending", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        expect(response.body.articles).toBeSortedBy("created_at", {
          coerce: true,
          descending: true,
        });
      });
  });
  it("should not return article bodies", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        articles.forEach((entry) => {
          expect(entry.body).toBe(undefined);
        });
      });
  });
});
