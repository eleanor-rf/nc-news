const app = require("../app.js");
const request = require("supertest");
const db = require("../db/connection.js");
const seed = require("../db/seeds/seed.js");
const testData = require("../db/data/test-data");
const fs = require("fs/promises");

beforeEach(() => seed(testData));
afterAll(() => db.end());

describe("/api/articles tests", () => {
  describe("GET /api/articles/:article_id", () => {
    it("should return requested article with comment count", () => {
      const expected = {
        article_id: 1,
        title: "Living in the shadow of a great man",
        topic: "mitch",
        author: "butter_bridge",
        body: "I find this existence challenging",
        created_at: "2020-07-09T20:11:00.000Z",
        votes: 100,
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .get("/api/articles/1")
        .expect(200)
        .then((response) => {
          expect(response.body.article).toMatchObject({
            comment_count: 11,
            ...expected,
          });
        });
    });
    it("should return requested article with comment count = 0 for article with 0 comments", () => {
      const expected = {
        article_id: 4,
        title: "Student SUES Mitch!",
        topic: "mitch",
        author: "rogersop",
        body: "We all love Mitch and his wonderful, unique typing style. However, the volume of his typing has ALLEGEDLY burst another students eardrums, and they are now suing for damages",
        created_at: "2020-05-06T01:14:00.000Z",
        article_img_url:
          "https://images.pexels.com/photos/158651/news-newsletter-newspaper-information-158651.jpeg?w=700&h=700",
      };
      return request(app)
        .get("/api/articles/4")
        .expect(200)
        .then((response) => {
          expect(response.body.article).toMatchObject({
            comment_count: 0,
            ...expected,
          });
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
    it("should paginate correctly", () => {
      const orderedIds = [2, 3, 4, 5, 6, 7, 8, 9, 12, 13, 18];
      return request(app)
        .get("/api/articles/1/comments?limit=5&p=2")
        .expect(200)
        .then((response) => {
          const comments = response.body.comments;
          const responseCommentIds = comments.map(
            (comment) => comment.comment_id
          );
          expect(responseCommentIds).toEqual(orderedIds.slice(5, 10));
        });
    });
    it("returns an empty array if page number is beyond range", () => {
      return request(app)
        .get("/api/articles/1/comments?p=50")
        .expect(200)
        .then((response) => {
          expect(response.body.comments).toEqual([]);
        });
    });
    it("returns 400 bad request if inappropriate pages/limits given", () => {
      return request(app)
        .get("/api/articles/1/comments?limit=sggdfd&p=ddddd")
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

  describe("GET articles with topic query", () => {
    it("should return articles only with the given topic", () => {
      return request(app)
        .get("/api/articles?topic=mitch")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          articles.forEach((entry) => {
            expect(entry).toMatchObject({
              author: expect.any(String),
              title: expect.any(String),
              topic: "mitch",
              article_img_url: expect.any(String),
              created_at: expect.any(String),
              article_id: expect.any(Number),
              votes: expect.any(Number),
              comment_count: expect.any(Number),
            });
          });
        });
    });
    it("should return an empty array for a topic that exists but does not have any articles associated with it", () => {
      return request(app)
        .get("/api/articles?topic=paper")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toEqual([]);
        });
    });
    it("should return 404 not found if trying to filter by a topic that doesn't exist", () => {
      return request(app)
        .get("/api/articles?topic=sdklgfnsdklgmd")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
  });

  describe("GET /api/articles with sorting", () => {
    it("should sort articles as requested", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=asc")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toBeSortedBy("author", {
            ascending: true,
            coerce: true,
          });
        });
    });
    it("should sort articles as requested", () => {
      return request(app)
        .get("/api/articles?sort_by=topic&order=desc")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toBeSortedBy("topic", {
            descending: true,
            coerce: true,
          });
        });
    });
    it("should sort articles as requested", () => {
      return request(app)
        .get("/api/articles?sort_by=votes&order=asc")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          expect(articles).toBeSortedBy("votes", {
            ascending: true,
          });
        });
    });
    it("should give 400 bad request if invalid sort_by query is given", () => {
      return request(app)
        .get("/api/articles?sort_by=dsfdfgfdhs&order=asc")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    it("should give 400 bad request if invalid order query is given", () => {
      return request(app)
        .get("/api/articles?sort_by=author&order=sdhgfghdsdf")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });

  describe("POST /api/articles", () => {
    it("posts article and returns the posted article", () => {
      const newArticle = {
        author: "lurker",
        title: "test",
        body: "test",
        topic: "cats",
        article_img_url: "test",
      };

      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then((response) => {
          const createdAt = new Date(response.body.article.created_at);
          const isValidCreatedDate = !isNaN(createdAt.getTime());
          expect(response.body.article).toMatchObject({
            article_id: expect.any(Number),
            votes: 0,
            comment_count: 0,
            ...newArticle,
          });
          expect(isValidCreatedDate).toBe(true);
        });
    });
    it("gives the default image url if one is not provided", () => {
      const newArticle = {
        author: "lurker",
        title: "test",
        body: "test",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(201)
        .then((response) => {
          const createdAt = new Date(response.body.article.created_at);
          const isValidCreatedDate = !isNaN(createdAt.getTime());
          expect(response.body.article).toMatchObject({
            article_id: expect.any(Number),
            article_img_url:
              "https://images.pexels.com/photos/97050/pexels-photo-97050.jpeg?w=700&h=700",
            votes: 0,
            comment_count: 0,
            ...newArticle,
          });
          expect(isValidCreatedDate).toBe(true);
        });
    });
    it("gives 400 bad request if trying to post an article with required fields missing", () => {
      const newArticle = {
        author: "lurker",
        body: "test",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    it("gives 404 not found if trying to post an article with an author who doesn't exist", () => {
      const newArticle = {
        author: "dsgfdgfdgd",
        body: "test",
        title: "test",
        topic: "cats",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    it("gives 404 not found if trying to post an article with a topic that doesn't exist", () => {
      const newArticle = {
        author: "lurker",
        body: "test",
        title: "test",
        topic: "ddddddddd",
      };
      return request(app)
        .post("/api/articles")
        .send(newArticle)
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
  });

  describe("GET /api/articles with pagination", () => {
    it("returns the expected article in the correct order, starting at the correct page", () => {
      const orderedIds = [3, 6, 2, 12, 13, 5, 1, 9, 10, 4, 8, 11, 7];

      return request(app)
        .get("/api/articles?limit=5&p=2")
        .expect(200)
        .then((response) => {
          const articles = response.body.articles;
          const responseArticleIds = articles.map(
            (article) => article.article_id
          );
          expect(responseArticleIds).toEqual(orderedIds.slice(5, 10));
        });
    });
    it("returns no comments for page numbers out of bounds", () => {
      return request(app)
        .get("/api/articles?p=50")
        .expect(200)
        .then((response) => {
          expect(response.body.articles).toEqual([]);
        });
    });
    it("returns 400 bad request if inappropriate pages/limits given", () => {
      return request(app)
        .get("/api/articles?limit=sggdfd&p=ddddd")
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api/comments tests", () => {
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

  describe("PATCH /api/comments/:comment_id", () => {
    it("should update comment votes and return updated comment", () => {
      const expected = {
        body: "Oh, I've got compassion running out of my nose, pal! I'm the Sultan of Sentiment!",
        author: "butter_bridge",
        article_id: 9,
        created_at: "2020-04-06T12:17:00.000Z",
      };

      return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: 14 })
        .expect(200)
        .then((response) => {
          expect(response.body.comment).toMatchObject({
            votes: 30,
            ...expected,
          });
        });
    });
    it("should 400 bad request if inc_votes is not provided", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ dsjklfns: 43665 })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    it("should 400 bad request if inc_votes isn't an integer", () => {
      return request(app)
        .patch("/api/comments/1")
        .send({ inc_votes: "test" })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
    it("should 404 not found if articleid isn't found", () => {
      return request(app)
        .patch("/api/comments/13464564564")
        .send({ inc_votes: 17 })
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toBe("Not found");
        });
    });
    it("should 400 bad request if articleid is invalid", () => {
      return request(app)
        .patch("/api/comments/sdfdfgdf")
        .send({ inc_votes: "test" })
        .expect(400)
        .then((response) => {
          expect(response.body.msg).toBe("Bad request");
        });
    });
  });
});

describe("/api tests (endpoints)", () => {
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
});

describe("/api/topics tests", () => {
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
});

describe("/api/users tests", () => {
  describe("get users", () => {
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

  describe("select user by username", () => {
    it("should return the selected user", () => {
      const user = {
        username: "butter_bridge",
        name: "jonny",
        avatar_url:
          "https://www.healthytherapies.com/wp-content/uploads/2016/06/Lime3.jpg",
      };

      return request(app)
        .get("/api/users/butter_bridge")
        .expect(200)
        .then((response) => {
          expect(response.body.user).toEqual(user);
        });
    });
    it("should 404 if user doesn't exist", () => {
      return request(app)
        .get("/api/users/bsdfsdgdfhgfhgf")
        .expect(404)
        .then((response) => {
          expect(response.body.msg).toEqual("Not found");
        });
    });
  });
});
