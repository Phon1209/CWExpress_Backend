require("dotenv").config();

const app = require("./functions/app");

const PORT = process.env.PORT || 3000;

app.get("/test", (req, res, next) => {
  res.json("Hello new app");
});

app.listen(PORT, () => {
  console.log("App started on port ", PORT);
});
