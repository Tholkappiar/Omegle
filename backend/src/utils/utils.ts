export function normalizeHeaders(req: any): Headers {
    const headers = new Headers();
    for (const [key, value] of Object.entries(req.headers)) {
        if (typeof value === "string") {
            headers.set(key, value);
        } else if (Array.isArray(value)) {
            headers.set(key, value.join(","));
        }
    }

    return headers;
}
