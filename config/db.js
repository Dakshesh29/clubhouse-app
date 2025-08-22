// config/db.js
import { Sequelize } from "sequelize";

const sequelize = new Sequelize("clubhouse", "postgres", "GAM2906DB", {
  host: "localhost",
  dialect: "postgres",
});

export default sequelize;
