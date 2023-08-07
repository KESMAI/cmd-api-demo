const Sequelize = require("sequelize");
const dotenv = require("dotenv");

// Model 불러오기
const User = require("./user");
const db = {};

const sequelize = new Sequelize(
  process.env.MYSQL_DB,
  process.env.MYSQL_USER,
  process.env.MYSQL_PASS,
  {
    host: process.env.MYSQL_HOST,
    dialect: "mysql",
  }
);

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.User = User;

User.init(sequelize);

User.associate(db);

module.exports = db;
