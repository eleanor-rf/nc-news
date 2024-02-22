# Northcoders News API 🗞️🐕

![NodeJS](https://img.shields.io/badge/node.js-6DA55F?style=for-the-badge&logo=node.js&logoColor=white)
![Postgres](https://img.shields.io/badge/postgres-%23316192.svg?style=for-the-badge&logo=postgresql&logoColor=white) ![Express.js](https://img.shields.io/badge/express.js-%23404d59.svg?style=for-the-badge&logo=express&logoColor=%2361DAFB) ![Jest](https://img.shields.io/badge/-jest-%23C21325?style=for-the-badge&logo=jest&logoColor=white)

An API for a news site with various endpoints to interact with databases of articles, comments, users, etc. Created as a backend project during the Northcoders 13-week Software Engineering bootcamp.

The API is hosted with Render and ElephantSQL. This link https://nc-news-tu4n.onrender.com/api provides a list of available endpoints.

## To run locally

### Prerequisites

- Node v21.6.2
- Postgres v8.11.3

### Local installation

1. Clone this repository:

`git clone https://github.com/eleanor-rf/nc-news.git`

2. In the root folder, create `.env.test` and `.env.development`.

In `.env.test` set `PGDATABASE=nc_news_test`.

In `.env.development` set `PGDATABASE=nc_news`.

3. In the root folder run the following commands to set up and seed the test database:

```
npm setup-dbs
npm seed
```

4. To run tests, run:

`npm test`
