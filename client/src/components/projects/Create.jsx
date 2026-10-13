import { useState } from "react";
import { request, STATUSES, displayName, Notice } from "../Icon";
import "./projects.css";

const Create = ({ users, onCreated }) => {
    /* Fields */
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState(STATUSES[0]);
    const [leadId, setLeadId] = useState("");
    const [errors, setErrors] = useState({});
    /* Server Notices */
    const [notice, setNotice] = useState("");
    const [noticeType, setNoticeType] = useState("");

    const [submitting, setSubmitting] = useState(false);

    /* Remove a field's error styling once the user edits it */
    const clearError = (field) => {
        if (errors[field]) setErrors((prev) => ({ ...prev, [field]: false }));
    };

    /* Submit Form */
    const handleSubmit = async (event) => {
        event.preventDefault();

        /* Required fields empty - POST request still sent so the backend validates (same as pa2) */
        const project = { name: name.trim(), description: description.trim() };
        setErrors({
            name: !project.name,
            description: !project.description,
            status: !status,
            leadId: !leadId
        });
        
        
        setSubmitting(true);
        /* POST Request */
        const { ok, status, data } = await request("/projects", {
            method: "POST",
            body: { ...project, status, project_lead_id: leadId }
        }, () => {
            setNoticeType("error");
            setNotice("Could not connect to the server");
        });
        setSubmitting(false);
        
        if (ok) {
            /* Success - the page reloads its project list, closes this overlay and shows the message */
            onCreated(data.message || `"${project.name}" was created.`);
        } else {
            /* Error - show the server's message, highlight the lead if that's the problem */
            setNotice({ type: "error", text: data.message || "Could not create the project." });
            if (/lead/i.test(data.message ?? "")) setErrors((prev) => ({ ...prev, leadId: true }));
        }
    };

    /* JSX */
    return (
        <div className="panel-card form-card">
            <h2>Create a Project</h2>
            <p className="panel-sub">The project lead is added as the first member automatically.</p>

            <form onSubmit={handleSubmit} noValidate>
                <div className="field">
                    <label htmlFor="project-name">Name</label>
                    <input
                        id="project-name"
                        type="text"
                        className={`control ${errors.name ? "error" : ""}`}
                        placeholder="e.g. Customer Portal"
                        value={name}
                        onChange={(event) => { setName(event.target.value); clearError("name"); }}
                    />
                    {errors.name && <span className="field-hint">Name is required</span>}
                </div>

                <div className="field">
                    <label htmlFor="project-description">Description</label>
                    <textarea
                        id="project-description"
                        rows={4}
                        className={`control ${errors.description ? "error" : ""}`}
                        placeholder="What is this project about?"
                        value={description}
                        onChange={(event) => { setDescription(event.target.value); clearError("description"); }}
                    />
                    {errors.description && <span className="field-hint">Description is required</span>}
                </div>

                <div className="field-row">
                    <div className="field">
                        <label htmlFor="project-status">Status</label>
                        <select
                            id="project-status"
                            className={`control ${errors.status ? "error" : ""}`}
                            value={status}
                            onChange={(event) => { setStatus(event.target.value); clearError("status"); }}
                        >
                            {STATUSES.map((option) => (
                                <option key={option} value={option}>{option}</option>
                            ))}
                        </select>
                    </div>

                    <div className="field">
                        <label htmlFor="project-lead">Project Lead</label>
                        <select
                            id="project-lead"
                            className={`control ${errors.leadId ? "error" : ""}`}
                            value={leadId}
                            onChange={(event) => { setLeadId(event.target.value); clearError("leadId"); }}
                        >
                            <option value="">Select a registered user</option>
                            {users.map((user) => (
                                <option key={user._id} value={user._id}>
                                    {displayName(user)} (@{user.username})
                                </option>
                            ))}
                        </select>
                        {errors.leadId && <span className="field-hint">Choose a project lead</span>}
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={submitting}>
                    {submitting ? "Creating..." : "Create Project"}
                </button>
            </form>

            {users.length === 0 && (
                <Notice type="error">No registered users found. Sign up a user first so you can pick a lead.</Notice>
            )}
            {notice && <Notice type={notice.type}>{notice.text}</Notice>}
        </div>
    );
};

export default Create;
