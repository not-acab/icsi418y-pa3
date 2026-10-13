import { Icon, displayName, displayUsername, initialsOf } from "../Icon";
import pencilSrc from "../../assets/pencil.svg";
import "./projects.css";

/* One project card. Completed projects are greyed out. */
const View = ({ project, onManage }) => {
    const isCompleted = project.status === "Completed";

    return (
        <article className={`project-card${isCompleted ? " is-completed" : ""}`}>
            <header className="project-card-head">
                <h3>{project.name}</h3>
                <span className={`status status-${String(project.status).toLowerCase()}`}>{project.status}</span>
            </header>
            <p className="project-description">{project.description}</p>
            <footer className="project-card-foot">
                <div className="project-lead">
                    <span className="avatar">{initialsOf(project.lead)}</span>
                    <div className="project-lead-text">
                        <span className="label">Project Lead</span>
                        <span className="name">{displayName(project.lead)}</span>
                        <span className="handle">@{displayUsername(project.lead)}</span>
                    </div>
                </div>
                <button type="button" className="btn btn-secondary" onClick={() => onManage(project._id)}>
                    <Icon src={pencilSrc} />
                    Manage Members
                </button>
            </footer>
        </article>
    );
};

export default View;
