export const API = "http://localhost:9000/api";
export const STATUSES = ["Planning", "Active", "Completed"];

/* fetch wrapper: never throws, always resolves { ok, status, data } */
export const request = async (path, { method, body } = {}, serverErrorCallback) => {
    try {
        /* Send Request */
        const response = await fetch(`${API}${path}`, {
            method: method ?? "GET",
            headers: body ? { "Content-Type": "application/json" } : undefined,
            body: body ? JSON.stringify(body) : undefined
        });
        /* Await Response */
        const data = await response.json();
        return { ok: response.ok, status: response.status, data: data };
    }
    catch (error) {
        console.error(error);
        serverErrorCallback?.();
        return null;
    }
};