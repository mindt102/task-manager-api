const express = require("express");
const UsersRoute = require("./routes/users.route");
const TasksRoute = require("./routes/tasks.route");
require("./db/mongoose");

const app = express();

app.use(express.json());
app.use("/users", UsersRoute);
app.use("/tasks", TasksRoute);

module.exports = app;
