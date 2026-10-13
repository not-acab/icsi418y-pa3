/* Shared bits used by the auth + project components */

export const API = "http://localhost:9000/api";
export const STATUSES = ["Planning", "Active", "Completed"];

/* Tinted icon: the svg is set as a mask so it follows the text color */
export const Icon = ({ src }) => {
    const mask = `url(${JSON.stringify(src)})`;
    return <span className="icon" aria-hidden="true" style={{ WebkitMaskImage: mask, maskImage: mask }} />;
};

/* Success / error message box */
export const Notice = ({ type, children }) => (
    <p className={`notice ${type}`} role={type === "error" ? "alert" : "status"}>{children}</p>
);



/* User display helpers - a user can be missing if the lead was deleted */
export const displayName = (user) =>
    `${user?.f_name ?? ""} ${user?.l_name ?? ""}`.trim() || user?.username || "Unknown user";

export const displayUsername = (user) => user?.username ?? "unknown";

export const initialsOf = (user) => {
    const initials = `${user?.f_name?.[0] ?? ""}${user?.l_name?.[0] ?? ""}`;
    return (initials || user?.username?.[0] || "?").toUpperCase();
};
