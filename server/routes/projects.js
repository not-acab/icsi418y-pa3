const express = require("express");
const { ObjectId } = require("mongodb");
const membershipRouter = require("./memberships");
const router = express.Router();

/* All Valid Statuses */
const STATUSES = ["Planning", "Active", "Completed"];

/* Object Id Helper (value) -> ObjectId (valid hex) | null (invalid) */
const toObjectId = (value) => {
    const char24_hex = /^[a-f\d]{24}$/i;
    return typeof value === "string" && char24_hex.test(value) ? new ObjectId(value) : null;
};

router.use("/:projectId/members", membershipRouter);

/* Create a new Project */
router.post("/", async (req, res) => {
    const projects = req.db.collection("projects");
    const users = req.db.collection("users");
    const memberships = req.db.collection("projectmemberships");
    const { name, description, status, project_lead_id } = req.body;

    /* Required fields are missing */
    if (!name || !description || !status || !project_lead_id) {
        return res.status(400).json({
            message: "All fields are required!"
        });
    }

    /* Validate status */
    if (!STATUSES.includes(status)) {
        return res.status(400).json({
            message: `Status must be one of: ${STATUSES.join(", ")}.`
        });
    }

    try {
        /* Validate project lead */
        const leadId = toObjectId(project_lead_id);
        const lead = leadId && await users.findOne({ _id: leadId });
        if (!lead) {
            return res.status(404).json({
                message: "The selected project lead does not exist."
            });
        }

        /* Add project into db */
        const project = {
            name: name,
            description: description,
            status: status,
            project_lead_id: lead._id
        };
        const projectId = await projects.insertOne(project).insertedId;

        /* Add lead to ProjectMemberships */
        try { await memberships.insertOne({ project_id: projectId, user_id: lead._id }); }
        catch (error) {
            /* Delete the half finsihed project if add fails */
            await projects.deleteOne({ _id: projectId });
            console.error(error);
            res.status(500).json({
                message: "Server error"
            });
        }

        /* Create Success */
        res.status(201).json({
            message: `"${project.name}" was created successfully!`,
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

/* Get all Projects */
router.get("/", async (req, res) => {
    const projects = req.db.collection("projects");
    try {
        const allProjects = await projects.aggregate([
            /* Sort by newest first */
            { $sort: { _id: -1 } },
            /* Left outer join with users collection */
            { $lookup: {
                from: "users",
                localField: "project_lead_id",
                foreignField: "_id",
                as: "lead"
            }},
            /* Unpack as "lead" array */
            { $unwind: { path: "$lead", preserveNullAndEmptyArrays: true } },
            /* Remove password from lead */
            { $unset: "lead.password" }
        ]).toArray();

        /* GET Success */
        res.json(allProjects);
        res.status(200).json({
            message: "Projects retrieved successfully."
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

module.exports = router;
