import "dotenv/config";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import bcrypt from "bcryptjs";
import db from "./config/db.js";

passport.use(
  new LocalStrategy(
    { usernameField: "username" },
    async (username, password, done) => {
      try {
        const { rows } = await db.query(
          "SELECT * FROM users WHERE username = $1",
          [username]
        );
        if (rows.length === 0) {
          return done(null, false, { message: "Incorrect email." });
        }
        const user = rows[0];

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
          return done(null, false, { message: "Incorrect password." });
        }

        return done(null, user);
      } catch (err) {
        return done(err);
      }
    }
  )
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const { rows } = await db.query("SELECT * FROM users WHERE id = $1", [id]);
    done(null, rows[0]);
  } catch (err) {
    done(err);
  }
});

export default passport;
