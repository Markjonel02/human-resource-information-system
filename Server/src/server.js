const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();
const connectDB = require("./config/connection.js");
const app = express();
const port = 3000;

/* middlewares */
app.use(express.json());
app.use(bodyParser.json);
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

/* routes */
app.get("/", (req, res) => {
  res.send({ message: "running on localhost" });
  console.log("Connected to the api");
});
/* running node environtment  */
connectDB()
  .then(() => {
    app.listen(port, () => console.log(`localhost is running on port ${port}`));
  })
  .catch((err) => {
    console.error("Error connecting to mongodb", err);
  });
