require("dotenv").config();
const express = require("express");
const sequelize = require("./db");
const router = require("./routes/index");
const errorHandler = require('./middleware/ErrorHandlingMiddleware')
const models = require('./models/models')

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use("/", router);
app.use(errorHandler);

const start = async () => {
  try {
    await sequelize.authenticate();
    // await sequelize.sync()
    app.listen(PORT, () => console.log(`Server Started on port ${PORT}`));
  } catch (e) {
    console.log(e);
  }
};

start();

module.exports = app;
