export class ApiError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

// JSON in/out for /api; FormData bodies (image uploads) are sent as multipart.
export async function api(path, { method = "GET", body } = {}) {
  const options = { method, headers: {} };
  if (body instanceof FormData) {
    options.body = body;
  } else if (body !== undefined) {
    options.body = JSON.stringify(body);
    options.headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`/api${path}`, options);
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiError(res.status, data?.error || "Something went wrong. Please try again.");
  }
  return data;
}

let metaPromise;
// Categories, location options and the map token never change while the page is open.
export function getMeta() {
  metaPromise ??= api("/meta").catch((err) => {
    metaPromise = undefined;
    throw err;
  });
  return metaPromise;
}
