const { Router } = require("express");
const { ObjectId } = require("mongodb");
const multer = require("multer");
const sharp = require("sharp");
const User = require("../models/users.model");
const auth = require("../middlewares/auth");

const router = Router();

router.get("/me", auth, async (req, res) => {
    res.json(req.user);
});

// router.get("/:userId", async (req, res) => {
//     try {
//         const { userId } = req.params;
//         const user = await User.findById(userId);
//         if (!user) {
//             return res.status(404).send();
//         }

//         res.status(200).json(user);
//     } catch (error) {
//         res.status(500).send();
//     }
// });

router.patch("/me", auth, async (req, res) => {
    const updates = Object.keys(req.body);
    const allowedUpdates = ["name", "email", "password", "age"];

    const isValid = updates.every((update) => allowedUpdates.includes(update));

    if (!isValid) {
        return res.status(400).json({ error: "Invalid updates" });
    }

    try {
        // const { userId } = req.params;
        // const user = await User.findById(userId);
        updates.forEach((update) => (req.user[update] = req.body[update]));
        await req.user.save();
        // const user = await User.findByIdAndUpdate(userId, req.body, {
        //     new: true,
        //     runValidators: true,
        // });
        // if (!user) {
        //     return res.status(404).send();
        // }

        res.json(req.user);
    } catch (error) {
        res.status(400).json(error);
    }
});

router.delete("/me", auth, async (req, res) => {
    try {
        // const user = await User.findByIdAndDelete(req.params.userId);

        // if (!user) {
        //     return res.status(404).send();
        // }
        await req.user.remove();
        res.status(200).json(req.user);
    } catch (error) {
        res.status(500).json(error);
    }
});

router.post("/", async (req, res) => {
    try {
        const user = new User(req.body);
        await user.save();
        const token = await user.generateAuthToken();
        res.status(201).json({ user, token });
    } catch (error) {
        res.status(400).json(error);
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findByCredentials(email, password);
        const token = await user.generateAuthToken();
        res.json({ user, token });
    } catch (error) {
        res.sendStatus(400);
    }
});

router.post("/logout", auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token;
        });
        await req.user.save();
        res.send();
    } catch (error) {
        res.status(500).send();
    }
});

router.post("/logoutAll", auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();
        res.sendStatus(200);
    } catch (error) {
        res.sendStatus(500);
    }
});

const upload = multer({
    // dest: "avatars",
    limits: {
        fileSize: 1000000,
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error("Please upload an image"));
        }
        cb(undefined, true);
    },
});

router.post(
    "/me/avatar",
    auth,
    upload.single("avatar"),
    async (req, res) => {
        // req.user.avatar = req.file.buffer;
        const buffer = await sharp(req.file.buffer)
            .resize({ width: 250, height: 250 })
            .png()
            .toBuffer();
        req.user.avatar = buffer;
        await req.user.save();
        res.send();
    },
    (error, req, res, next) => {
        res.status(400).json({ error: error.message });
    }
);

router.delete("/me/avatar", auth, async (req, res) => {
    req.user.avatar = undefined;
    await req.user.save();
    res.sendStatus(200);
});

router.get("/:userId/avatar", async (req, res) => {
    try {
        const user = await User.findById(req.params.userId);

        if (!user.avatar || !user) {
            throw new Error();
        }

        res.set("Content-Type", "image/png");
        res.send(user.avatar);
    } catch (error) {
        res.sendStatus(404);
    }
});
module.exports = router;
