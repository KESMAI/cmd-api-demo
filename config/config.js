require("dotenv").config();
const env = process.env;

const development = {
  username: env.MYSQL_USER,
  //env.MYSQL_USERNAME은 불러오고자 하는 데이터의 키값이므로 자유롭게 이름설정이 가능하다.
  password: env.MYSQL_PASS,
  database: env.MYSQL_DB,
  host: env.MYSQL_HOST,
  dialect: "mysql",
  //port: env.MYSQL_PORT
};

const production = {
  username: env.MYSQL_USER,
  password: env.MYSQL_PASS,
  database: env.MYSQL_DB,
  host: env.MYSQL_HOST,
  dialect: "mysql",
  //port: env.MYSQL_PORT
};

const test = {
  username: env.MYSQL_USER,
  password: env.MYSQL_PASS,
  database: env.MYSQL_DB,
  host: env.MYSQL_HOST,
  dialect: "mysql",
  //port: env.MYSQL_PORT
};

module.exports = { development, production, test };
