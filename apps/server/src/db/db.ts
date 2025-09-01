import { Pool } from "pg";

export const pool = new Pool({
  user: "postgres",
  host: "localhost",
  database: "mydatabase",
  password: "yourpassword",
  port: 5432,
});


