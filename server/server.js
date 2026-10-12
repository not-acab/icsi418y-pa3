require("dotenv").config();

const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");

/* Holds users from db collection. Successful db connection required */
let users;

const app = express();

app.use(express.json());
app.use(cors());

/* Signup Request */
app.post("/signup", async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }

    /* Signup Success */
    res.status(201).json({
        message: "User created successfully."
    });
});

/* Login Request */
app.post("/login", async (req, res) => {
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            message: "Server error"
        });
    }

    /* Login Success */
    res.status(200).json({
        message: "Login successful!"
    });
});

/* Health Check Request */
app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});


/* Start Server */
const connectDatabase = async() => {
    /* Connect to db */
    const client = new MongoClient(process.env.MONGO_URI);
    try {
        await client.connect();
        console.log("Connected to MongoDB");
    }
    catch (error) {
        console.error("Could not connect to MongoDB");
        console.error(error);
        process.exit(1)
    }

    /* Access db user collection */
    const db = client.db("pa2");
    users = db.collection("users");

    /* Only listen after a succesful connection */
    app.listen(9000, () => {
        console.log("Server running on port 9000");
    });
}

connectDatabase();