import express from "express";
import path from "path";
import session from "express-session";
import passport from "./passport-config.js";
import { fileURLToPath } from "url";

import indexRouter from "./routes/index.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  next();
});

app.use(express.urlencoded({ extended: false }));

app.use("/", indexRouter);

const port = 3000;
app.listen(port, () => console.log(`App listening on port ${port}!`));
