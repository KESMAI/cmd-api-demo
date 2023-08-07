const Sequelize = require("sequelize");
module.exports = class User extends Sequelize.Model {
  static init(sequelize) {
    return super.init(
      {
        id: {
          autoIncrement: true,
          type: Sequelize.INTEGER,
          allowNull: false,
          primaryKey: true,
        },
        user_name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        user_id: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        user_pw: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true,
        },
        token: {
          type: Sequelize.TEXT,
          allowNull: false,
          defaultValue: "",
        },
        user_balance: {
          type: Sequelize.INTEGER,
          allowNull: false,
          defaultValue: 0,
        },
      },
      {
        sequelize,
        modelName: "User",
        tableName: "users",
        timestamps: true,
        charset: "utf8mb4",
        collate: "utf8mb4_general_ci",
      }
    );
  }
  static associate(db) {}
};
