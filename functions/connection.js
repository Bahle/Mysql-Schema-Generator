var mysql = require('mysql2/promise');

module.exports = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "sms_project",
  waitForConnections: true
}) 

/*module.exports = mysql.createPool({
  host: "us-cdbr-iron-east-02.cleardb.net",
  user: "ba29a1d35336d9",
  password: "5002ef50",
  database: "heroku_8e03f614828d7e4",
  waitForConnections: true
})*/