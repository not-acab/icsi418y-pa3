import { useEffect, useState } from "react";
import Create from "./Create";
import Manage from "./Manage";
import View from "./View";
import { Icon, Notice } from "../Icon";
import Loading from "../Loading";
import plusSrc from "../../assets/plus.svg";
import closeSrc from "../../assets/close.svg";
import refreshSrc from "../../assets/refresh.svg";
import "./projects.css";

/* Modal wrapper for Create + Manage: Esc, the X, or a click on the backdrop closes it */
const Overlay = ({ label, onClose, children }) => {
    useEffect(() => {
        const onKey = (event) => { if (event.key === "Escape") onClose(); };
        document.addEventListener("keydown", onKey);
        return () => document.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
            <div className="overlay-dialog" role="dialog" aria-modal="true" aria-label={label}>
                <button type="button" className="overlay-close" onClick={onClose} aria-label="Close">
                    <Icon src={closeSrc} />
                </button>
                {children}
            </div>
        </div>
    );
};

const Viewer = ({ projects, allProjects, users, membersByProject, loading, error, onRefresh }) => {
    const [isCreating, setIsCreating] = useState(false);
    const [managingId, setManagingId] = useState("");
    /* Page level feedback, e.g. after a project is created */
    const [notice, setNotice] = useState(null);

    useEffect(() => {
        if (!notice) return;
        const timer = setTimeout(() => setNotice(null), 5000);
        return () => clearTimeout(timer);
    }, [notice]);

    /* The overlay reads from the loader data, so it updates as soon as a revalidate finishes.
       Looked up in the unfiltered list so a search/filter can't close it. */
    const total = allProjects.length;
    const managedProject = allProjects.find((project) => project._id === managingId);

    const handleCreated = async (message) => {
        await onRefresh();
        setIsCreating(false);
        setNotice({ type: "success", text: message });
    };

    return (
        <div className="view">
            <div className="panel-head">
                <h2>
                    All Projects
                    {!error && <span className="count">{projects.length === total ? total : `${projects.length} of ${total}`}</span>}
                </h2>
                <div className="panel-actions">
                    <button type="button" className="btn btn-secondary" onClick={onRefresh} disabled={loading}>
                        <Icon src={refreshSrc} />
                        Refresh
                    </button>
                    <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        <Icon src={plusSrc} />
                        New Project
                    </button>
                </div>
            </div>

            {notice && <Notice type={notice.type}>{notice.text}</Notice>}
            {loading && <Loading text="Refreshing..." />}

            {error && (
                <div className="panel-card">
                    <Notice type="error">{error}</Notice>
                    <button type="button" className="btn btn-secondary" onClick={onRefresh}>Try again</button>
                </div>
            )}

            {!error && total === 0 && (
                <div className="empty">
                    <p>No projects yet.</p>
                    <button type="button" className="btn btn-primary" onClick={() => setIsCreating(true)}>
                        <Icon src={plusSrc} />
                        Create the first one
                    </button>
                </div>
            )}

            {!error && total > 0 && projects.length === 0 && (
                <div className="empty"><p>No projects match your search.</p></div>
            )}

            {!error && projects.length > 0 && (
                <div className="project-grid">
                    {projects.map((project) => (
                        <View key={project._id} project={project} onManage={setManagingId} />
                    ))}
                </div>
            )}

            {isCreating && (
                <Overlay label="Create a project" onClose={() => setIsCreating(false)}>
                    <Create users={users} onCreated={handleCreated} />
                </Overlay>
            )}

            {managedProject && (
                <Overlay label={`Manage ${managedProject.name}`} onClose={() => setManagingId("")}>
                    <Manage
                        project={managedProject}
                        members={membersByProject[managedProject._id] ?? []}
                        users={users}
                        onChanged={onRefresh}
                    />
                </Overlay>
            )}
        </div>
    );
};

export default Viewer;
