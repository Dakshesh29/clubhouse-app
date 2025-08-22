import { Pool } from "pg";

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "clubhouse",
  password: "GAM2906DB",
  port: 5432,
});

export default {
  query: (text, params) => pool.query(text, params),
};
