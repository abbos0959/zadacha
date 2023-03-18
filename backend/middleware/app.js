const express = require("express");
const cookie = require("cookie-parser");
const ErrorController = require("../controller/errorController");
const UserRouter = require("../router/userRouter");
const CourceRouter = require("../router/courceRouter");
const app = express();
app.use(express.json());
app.use(cookie());

app.use("/api/user", UserRouter);
app.use("/api/cource", CourceRouter);

app.all("*", (req, res) => {
   res.status(404).json({
      message: ` bunday${req.originalUrl} mavjud emas`,
   });
});

app.use(ErrorController);

module.exports = app;
