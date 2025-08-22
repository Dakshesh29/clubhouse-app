import express from "express";
import sequelize from "./config/db.js";
import indexRouter from "./routes/index.js";

const app = express();
const PORT = 3000;

app.set("view engine", "ejs");

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});
app.use("/", indexRouter);

const startApp = async () => {
  try {
    await sequelize.sync();
    console.log("Database synced successfully.");

    app.listen(PORT, () => {
      console.log(`Server is listening on port ${PORT}`);
    });
  } catch (error) {
    console.error("Unable to start the app:", error);
  }
};

startApp();
