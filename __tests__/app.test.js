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

describe("GET /api/articles", () => {
  it("should get all articles with comment_count", () => {
    return request(app)
      .get("/api/articles")
      .expect(200)
      .then((response) => {
        const articles = response.body.articles;
        expect(articles.length).toBe(13);
        articles.forEach((entry) => {
          expect(entry).toMatchObject({
            author: expect.any(String),
            title: expect.any(String),
            topic: expect.any(String),
            article_img_url: expect.any(String),
            created_at: expect.any(String),
            article_id: expect.any(Number),
            votes: expect.any(Number),
            comment_count: expect.any(Number),
          });
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

describe("GET /api/articles/:article_id/comments", () => {
  it("should return requested comments", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        const comments = response.body.comments;
        if (comments.length > 0) {
          comments.forEach((entry) => {
            expect(entry).toMatchObject({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: 1,
            });
          });
        }
      });
  });
  it("should return an empty array without an error if article has 0 comments", () => {
    return request(app)
      .get("/api/articles/2/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toEqual([]);
      });
  });
  it("should return comments sorted newest first", () => {
    return request(app)
      .get("/api/articles/1/comments")
      .expect(200)
      .then((response) => {
        expect(response.body.comments).toBeSortedBy("created_at", {
          coerce: true,
          descending: true,
        });
      });
  });
  it("should 404 not found if requesting a non existent article", () => {
    return request(app)
      .get("/api/articles/4354574566575645/comments")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
  it("should 400 bad request if requesting anything other than an integer for article id", () => {
    return request(app)
      .get("/api/articles/forklift/comments")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("POST comment to article", () => {
  it("should return the posted comment", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "butter_bridge", body: "test comment" })
      .expect(201)
      .then((response) => {
        const createdAt = new Date(response.body.comment.created_at);
        const isValidCreatedDate = !isNaN(createdAt.getTime());
        expect(response.body.comment).toMatchObject({
          author: "butter_bridge",
          body: "test comment",
          article_id: 1,
          comment_id: expect.any(Number),
          votes: 0,
        });
        expect(isValidCreatedDate).toBe(true);
      });
  });
  it("should ignore unnecessary properties", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({
        username: "butter_bridge",
        body: "test comment",
        a: "b",
        c: "d",
        e: "f",
      })
      .expect(201)
      .then((response) => {
        const createdAt = new Date(response.body.comment.created_at);
        const isValidCreatedDate = !isNaN(createdAt.getTime());
        expect(response.body.comment).toMatchObject({
          author: "butter_bridge",
          body: "test comment",
          article_id: 1,
          comment_id: expect.any(Number),
          votes: 0,
        });
        expect(isValidCreatedDate).toBe(true);
      });
  });
  it("should 400 bad request if username and/or body not provided", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ test: "test" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  it("should 404 not found if attempting to post to an article id that does not exist", () => {
    return request(app)
      .post("/api/articles/1325634645/comments")
      .send({ username: "butter_bridge", body: "test comment" })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
  it("should 400 bad request if attempting to post to an invalid article id", () => {
    return request(app)
      .post("/api/articles/adfhgfgjghjk/comments")
      .send({ username: "butter_bridge", body: "test comment" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  it("should 404 not found if attempting to post from a username that does not exist", () => {
    return request(app)
      .post("/api/articles/1/comments")
      .send({ username: "test", body: "test comment" })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
});

describe("patch article", () => {
  it("should update an article and return the updated article", () => {
    const article1 = {
      created_at: "2020-07-09T20:11:00.000Z",
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1000 })
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          votes: -900,
          ...article1,
        });
      });
  });
  it("should ignore anything that isn't inc_votes", () => {
    const article1 = {
      created_at: "2020-07-09T20:11:00.000Z",
      title: "Living in the shadow of a great man",
      topic: "mitch",
      author: "butter_bridge",
      body: "I find this existence challenging",
      article_img_url:
        "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
    };
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: -1000, a: "b", c: "d" })
      .expect(200)
      .then((response) => {
        expect(response.body.article).toMatchObject({
          votes: -900,
          ...article1,
        });
      });
  });
  it("should 400 bad request if inc_votes is not provided", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ dsjklfns: 43665 })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  it("should 400 bad request if inc_votes isn't an integer", () => {
    return request(app)
      .patch("/api/articles/1")
      .send({ inc_votes: "test" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
  it("should 404 not found if articleid isn't found", () => {
    return request(app)
      .patch("/api/articles/13464564564")
      .send({ inc_votes: 17 })
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
  it("should 400 bad request if articleid is invalid", () => {
    return request(app)
      .patch("/api/articles/sdfdfgdf")
      .send({ inc_votes: "test" })
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe("delete comment by id", () => {
  it("should delete a comment by comment ID ", () => {
    return request(app).delete("/api/comments/1").expect(204);
  });
  it("should return 404 if an incorrect id is supplied", () => {
    return request(app)
      .delete("/api/comments/1000")
      .expect(404)
      .then((response) => {
        expect(response.body.msg).toBe("Not found");
      });
  });
  it("should return 400 if an invalid id is supplied", () => {
    return request(app)
      .delete("/api/comments/fdgfdhfg")
      .expect(400)
      .then((response) => {
        expect(response.body.msg).toBe("Bad request");
      });
  });
});

describe.only("get users", () => {
  it("should return all users", () => {
    return request(app)
      .get("/api/users")
      .expect(200)
      .then((response) => {
        const users = response.body.users;
        expect(users.length).toBe(4);
        users.forEach((entry) => {
          expect(entry).toMatchObject({
            name: expect.any(String),
            username: expect.any(String),
            avatar_url: expect.any(String),
          });
        });
      });
  });
});
