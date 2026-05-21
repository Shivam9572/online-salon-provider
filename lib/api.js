const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL || "/api";

export async function apiFetch(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const headers = { ...(options.headers || {}) };

  // 2. Conditionally set JSON header only if body is NOT FormData
  if (!(options.body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }
   const res = await fetch(url, {
    credentials: 'include',
    ...options,
    headers: headers, // 3. Inject the dynamic headers object
  });
  if (!res.ok) {
    const text = await res.text();
    const err = new Error(text || res.statusText);
    err.status = res.status;
    throw err;
  }
  try {
    return await res.json();
  } catch (_) {
    return null;
  }
}

export const getApiBase = () => API_BASE;

export default { apiFetch, getApiBase };
