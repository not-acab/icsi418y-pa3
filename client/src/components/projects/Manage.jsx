import { useState } from "react";
import { Icon, Notice, request, displayName, displayUsername, initialsOf } from "../Icon";
import plusSrc from "../../assets/plus.svg";
import "./projects.css";

/* Overlay content for editing project membership.
   members come from the route loader; onChanged() revalidates it so the list updates. */
const Manage = ({ project, members, users, onChanged }) => {
    const [newUserId, setNewUserId] = useState("");
    /* "" = idle, "add" = adding, or the id of the member being removed */
    const [busy, setBusy] = useState("");
    const [notice, setNotice] = useState(null);

    const memberIds = new Set(members.map((member) => member._id));
    const membersPath = `/projects/${project._id}/members`;

    /* Add a member */
    const handleAdd = async (event) => {
        event.preventDefault();
        setBusy("add");

        /* POST Request - sent even when nothing is selected so the backend validates */
        const { ok, data } = await request(membersPath, {
            method: "POST",
            body: { user_id: newUserId }
        });

        if (ok) {
            setNewUserId("");
            await onChanged();
        }
        setNotice({
            type: ok ? "success" : "error",
            text: data.message || (ok ? "Member added." : "Could not add the member.")
        });
        setBusy("");
    };

    /* Remove a member (the lead has no button, and the server refuses too) */
    const handleRemove = async (member) => {
        setBusy(member._id);

        const { ok, data } = await request(`${membersPath}/${member._id}`, { method: "DELETE" });

        if (ok) await onChanged();
        setNotice({
            type: ok ? "success" : "error",
            text: data.message || (ok ? "Member removed." : "Could not remove the member.")
        });
        setBusy("");
    };

    return (
        <div className="manage">
            <header className="project-card-head">
                <h2>{project.name}</h2>
                <span className={`status status-${String(project.status).toLowerCase()}`}>{project.status}</span>
            </header>
            {notice && <Notice type={notice.type}>{notice.text}</Notice>}
            <div className="manage-grid">
                <section className="panel-card">
                    <h3>
                        Members
                        <span className="count">{members.length}</span>
                    </h3>
                    {members.length === 0 && (
                        <p className="placeholder">This project has no members.</p>
                    )}
                    <ul className="member-list">
                        {members.map((member) => {
                            const isLead = member._id === project.project_lead_id;
                            return (
                                <li key={member._id} className="member">
                                    <span className="avatar">{initialsOf(member)}</span>
                                    <div className="member-info">
                                        <span className="name">{displayName(member)}</span>
                                        <span className="handle">@{displayUsername(member)}</span>
                                    </div>
                                    {isLead ? (
                                        <span className="lead-badge">Lead</span>
                                    ) : (
                                        <button
                                            type="button"
                                            className="btn btn-danger"
                                            disabled={busy !== ""}
                                            onClick={() => handleRemove(member)}
                                            title={`Remove ${displayName(member)} from ${project.name}`}
                                        >
                                            {busy === member._id ? "Removing..." : "Remove"}
                                        </button>
                                    )}
                                </li>
                            );
                        })}
                    </ul>
                </section>

                <section className="panel-card">
                    <h3>Add a Member</h3>
                    <form onSubmit={handleAdd} noValidate>
                        <div className="field">
                            <label htmlFor="add-member">Registered user</label>
                            <select
                                id="add-member"
                                className="control"
                                value={newUserId}
                                onChange={(event) => setNewUserId(event.target.value)}
                            >
                                <option value="">Select a user</option>
                                {users.map((user) => (
                                    <option key={user._id} value={user._id}>
                                        {memberIds.has(user._id) ? "Member - " : "Not a member - "}
                                        {displayName(user)} (@{user.username})
                                    </option>
                                ))}
                            </select>
                        </div>
                        <button type="submit" className="btn btn-primary btn-block" disabled={busy !== ""}>
                            <Icon src={plusSrc} />
                            {busy === "add" ? "Adding..." : "Add to Project"}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
};

export default Manage;
