/*
 *
 *
 * API Structure for the front end to talk to the backend.
 *
 * /api/users (POST) -> Create a new user (signup)
 * /api/users (GET) -> Get all registered users
 * /api/users/login (POST) {username, password} -> Login
 *
 * /api/projects (POST) {name, description, status, project_lead_id} -> Create a new project
 * /api/projects (GET) -> Get all projects (each includes its project lead)
 * /api/projects/:projectId/members (GET) -> Get all members of a project
 * /api/projects/:projectId/members (POST) {user_id} -> Add a member to a project
 * /api/projects/:projectId/members/:userId (DELETE) -> Remove a member from a project
 *
 * Collections: users, projects, projectmemberships
 *
 */

require("dotenv").config();

const { MongoClient } = require("mongodb");
const express = require("express");
const cors = require("cors");
const usersRouter = require("./routes/users");
const projectsRouter = require("./routes/projects");

const app = express();

app.use(express.json());
app.use(cors());

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

    /* Access db */
    const db = client.db("pa2");

    /* A user can only be in a project once - enforced by the db, not just the routes */
    await db.collection("projectmemberships").createIndex(
        { project_id: 1, user_id: 1 },
        { unique: true }
    );

    /* Inject db into routes - must be registered BEFORE the routers */
    app.use((req, res, next) => {
        req.db = db;
        next();
    });

    app.use("/api/users", usersRouter);
    app.use("/api/projects", projectsRouter);

    /* Anything that slipped past a route's own try/catch */
    app.use((error, req, res, next) => {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    });

    /* Only listen after a succesful connection */
    app.listen(9000, () => {
        console.log("Server running on port 9000");
    });
}

connectDatabase();
