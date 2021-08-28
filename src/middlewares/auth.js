const jwt = require("jsonwebtoken");
const User = require("../models/users.model");
const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY;
const auth = async (req, res, next) => {
    try {
        const token = req.header("Authorization").replace("Bearer ", "");
        const decoded = jwt.verify(token, JWT_SECRET_KEY);
        const user = await User.findOne({
            _id: decoded._id,
            "tokens.token": token,
        });
        if (!user) {
            throw new Error();
        }
        req.user = user;
        req.token = token;
        next();
    } catch (error) {
        res.status(401).json({ error: "Please authenticate" });
    }
};

module.exports = auth;
