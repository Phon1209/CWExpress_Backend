require("dotenv").config();

const app = require("./functions/app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log("App started on port ", PORT);
});
