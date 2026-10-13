const express = require("express");
const router = express.Router();

/* Get all users */
router.get("/", async (req, res) => {
    const users = req.db.collection("users");
    try {
        const allUsers = await users.find({}, { projection: { password: 0 } }).toArray();
        /* GET Success */
        res.json(allUsers);
        res.status(200).json({
            message: "Users retrieved successfully."
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

/* Signup Request */
router.post("/", async (req, res) => {
    const users = req.db.collection("users");
    const { firstname, lastname, username, password } = req.body;

    /* Required field is missing */
    if (!username) {
        return res.status(400).json({
            message: "All fields are required!"
        });
    }

    try {
        /* Check for username already in db */
        if (await users.findOne({ username })) {
            return res.status(409).json({
                message: "User exists" //must contain "exists" for app validation
            });
        }

        /* Required fields are missing */
        if (!firstname || !lastname || !password) {
        return res.status(400).json({
            message: "All fields are required!"
        });
    }

        /* Add user into db */
        await users.insertOne({
            f_name: firstname,
            l_name: lastname,
            username: username,
            password: password
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }

    /* Signup Success */
    res.status(201).json({
        message: "User created successfully. Please Login."
    });
});

/* Login Request */
router.post("/login", async (req, res) => {
    const users = req.db.collection("users");
    const { username, password } = req.body;

    /* Required field missing */
    if (!username) {
        return res.status(400).json({
            message: "Username and password are required!" 
        });
    }

    try {
        /* Find user by username */
        const user = await users.findOne({ username });

        if (!user) {
            return res.status(401).json({
                message: "User does not exist." //must contain "does not exist" for app validation
            });
        }

        if (user.password !== password) {
            return res.status(401).json({
                message: "Incorrect Password!"
            });
        }

        /* Login Success */
        res.status(200).json({
            message: "Login successful!",
            /* Return (non-privileged) user information */
            user: {
                _id: user._id,
                username: user.username,
                f_name: user.f_name,
                l_name: user.l_name
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;