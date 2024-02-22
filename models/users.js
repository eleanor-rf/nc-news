const db = require("../db/connection");

exports.selectUsers = () => {
  return db.query("SELECT * FROM users;").then((userData) => {
    return userData.rows;
  });
};

exports.selectUserByUsername = (username) => {
  return db
    .query("SELECT * FROM users WHERE username = $1", [username])
    .then((userData) => {
      if (userData.rows.length) {
        return userData.rows[0];
      } else {
        return Promise.reject({ status: 404, msg: "Not found" });
      }
    });
};
