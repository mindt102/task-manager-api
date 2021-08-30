const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const User = require("../../src/models/users.model");
const Task = require("../../src/models/tasks.model");

const userOneId = new mongoose.Types.ObjectId();
const userOne = {
    _id: userOneId,
    name: "Jacob",
    email: "jacob@example.com",
    password: "56what!!",
    tokens: [
        {
            token: jwt.sign({ _id: userOneId }, process.env.JWT_SECRET_KEY),
        },
    ],
};

const userTwoId = new mongoose.Types.ObjectId();
const userTwo = {
    _id: userTwoId,
    name: "Michael",
    email: "michael@example.com",
    password: "michael123$",
    tokens: [
        {
            token: jwt.sign({ _id: userTwoId }, process.env.JWT_SECRET_KEY),
        },
    ],
};

const taskOne = {
    _id: new mongoose.Types.ObjectId(),
    description: "First task",
    completed: false,
    owner: userOne._id,
};

const taskTwo = {
    _id: new mongoose.Types.ObjectId(),
    description: "Second task",
    completed: true,
    owner: userOne._id,
};

const taskThree = {
    _id: new mongoose.Types.ObjectId(),
    description: "Third task",
    completed: true,
    owner: userTwo._id,
};

const setupDataBase = async () => {
    await User.deleteMany();
    await Task.deleteMany();
    await new User(userOne).save();
    await new User(userTwo).save();
    await new Task(taskOne).save();
    await new Task(taskTwo).save();
    await new Task(taskThree).save();
};

module.exports = {
    userOne,
    userOneId,
    userTwo,
    userTwoId,
    setupDataBase,
    taskOne,
    taskTwo,
    taskThree,
};
