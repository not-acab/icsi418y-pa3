import { useState } from "react";
import { Navigate, useLoaderData, useOutletContext, useRevalidator } from "react-router";
import Viewer from "../components/projects/Viewer";
import { Icon, request, STATUSES, displayName } from "../components/Icon";
import searchSrc from "../assets/search.svg";
import filterSrc from "../assets/filter.svg";
import sortUpSrc from "../assets/sort-up.svg";
import sortDownSrc from "../assets/sort-down.svg";
import "./Projects.css";

/* Route loader - runs before /projects renders, and again after every revalidate() */
export const loader = async () => {
    res = { projects: [], users: [], membersByProject: {} };
    const [projectsRes, usersRes] = await Promise.all([
        request("/projects", { method: "GET" }, () => {
            console.error("Could not connect to the server");
        }), 
        request("/users", { method: "GET" }, () => {
            console.error("Could not connect to the server");
        })
    ]);
    if (projectsRes === null || usersRes === null) return { ...res, error: "Could not load projects." };

    /* Members of every project id */
    const projects = projectsRes.data;
    const membersRes = await Promise.all( projects.map((project) => request(
        `/projects/${project._id}/members`, { method: "GET" }, () => {
        }
    )));
    if (membersRes === null) return { ...res, error: "Could not load project members." };
    
    /* Map members to their respective projects */
    const membersByProject = {};
    projects.forEach((project, index) => {
        membersByProject[project._id] = membersRes[index].data;
    });
    return { projects, users: usersRes.data, membersByProject, error: "" };
};

const Projects = () => {
    const { isLoggedIn } = useOutletContext();
    const { projects, users, membersByProject, error } = useLoaderData();
    const revalidator = useRevalidator();

    /* Search / filter / sort */
    const [query, setQuery] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [sortAsc, setSortAsc] = useState(true);

    if (!isLoggedIn) return <Navigate to="/" replace />;

    const needle = query.trim().toLowerCase();
    const visible = projects
        .filter((project) => !statusFilter || project.status === statusFilter)
        .filter((project) => !needle || [project.name, project.description, displayName(project.lead), project.lead?.username]
            .some((text) => String(text ?? "").toLowerCase().includes(needle)))
        .sort((a, b) => a.name.localeCompare(b.name) * (sortAsc ? 1 : -1));

    /* JSX */
    return (
        <div className="projects">
            <div className="projects-toolbar">
                <label className="projects-search">
                    <Icon src={searchSrc} />
                    <input
                        type="text"
                        placeholder="Search projects..."
                        aria-label="Search projects"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                    />
                </label>
                <label className="projects-filter">
                    <Icon src={filterSrc} />
                    <select
                        aria-label="Filter by status"
                        value={statusFilter}
                        onChange={(event) => setStatusFilter(event.target.value)}
                    >
                        <option value="">All statuses</option>
                        {STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                </label>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => setSortAsc((asc) => !asc)}
                    title="Sort by name"
                >
                    <Icon src={sortAsc ? sortUpSrc : sortDownSrc} />
                    Name
                </button>
            </div>

            <Viewer
                projects={visible}
                allProjects={projects}
                users={users}
                membersByProject={membersByProject}
                loading={revalidator.state === "loading"}
                error={error}
                onRefresh={() => revalidator.revalidate()}
            />
        </div>
    );
};

export default Projects;
