const { Router } = require("express");
const Task = require("../models/tasks.model");
const auth = require("../middlewares/auth");

const router = Router();

// GET /tasks?completed=true
// GET/tasks?limit=10&skip=
// GET/tasks?sortBy=createdAt:asc/desc
router.get("/", auth, async (req, res) => {
    try {
        const match = {};
        const sort = {};
        if (req.query.completed) {
            match.completed = req.query.completed === "true";
        }

        if (req.query.sortBy) {
            const parts = req.query.sortBy.split(":");
            sort[parts[0]] = parts[1] === "desc" ? -1 : 1;
        }

        // const tasks = await Task.find({});
        await req.user
            .populate({
                path: "tasks",
                match,
                options: {
                    limit: parseInt(req.query.limit),
                    skip: parseInt(req.query.skip),
                    sort,
                },
            })
            .execPopulate();
        res.status(200).json(req.user.tasks);
    } catch (error) {
        res.status(500).send();
    }
});

router.get("/:taskId", auth, async (req, res) => {
    try {
        const { taskId: _id } = req.params;
        // const task = await Task.findById(taskId);
        const task = await Task.findOne({ _id, owner: req.user._id });
        if (!task) {
            return res.status(404).send();
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).send();
    }
});

router.patch("/:taskId", auth, async (req, res) => {
    try {
        const updates = Object.keys(req.body);
        const allowUpdates = ["completed", "description"];

        const isValid = updates.every((update) =>
            allowUpdates.includes(update)
        );

        if (!isValid) {
            return res.status(400).json({ error: "Invalid updates!" });
        }

        const taskId = req.params.taskId;

        // const task = await Task.findById(taskId);
        const task = await Task.findOne({ _id: taskId, owner: req.user._id });

        if (!task) {
            return res.sendStatus(404);
        }

        updates.forEach((update) => (task[update] = req.body[update]));
        await task.save();

        // const task = await Task.findByIdAndUpdate(taskId, req.body, {
        //     new: true,
        //     runValidators: true,
        // });
        res.status(200).json(task);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.delete("/:taskId", auth, async (req, res) => {
    try {
        const task = await Task.findOneAndDelete({
            _id: req.params.taskId,
            owner: req.user._id,
        });

        if (!task) {
            return res.sendStatus(404);
        }
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post("/", auth, async (req, res) => {
    try {
        // const task = new Task(req.body);
        const task = new Task({
            ...req.body,
            owner: req.user._id,
        });
        await task.save();
        res.status(201).json(task);
    } catch (error) {
        res.status(400).json(error);
    }
});

module.exports = router;
