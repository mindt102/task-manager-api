const express = require("express");
const UsersRoute = require("./routes/users.route");
const TasksRoute = require("./routes/tasks.route");
require("./db/mongoose");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 3000;

// app.use((req, res, next) => {
//     res.status(503).send("Site is currently down.");
// });

app.use(express.json());
app.use("/users", UsersRoute);
app.use("/tasks", TasksRoute);

app.listen(port, () => {
    console.log(`Server is listening on port ${port}...`);
});
