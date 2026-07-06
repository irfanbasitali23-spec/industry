const API_BASE = '/api';

function getToken() {
  return localStorage.getItem('access_token');
}

export function setToken(token) {
  localStorage.setItem('access_token', token);
}

export function clearToken() {
  localStorage.removeItem('access_token');
}

async function request(url, options = {}) {
  const token = getToken();
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${API_BASE}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (res.status === 401) {
    clearToken();
    window.location.href = '/login';
    return null;
  }

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    const message = typeof data?.detail === 'string'
      ? data.detail
      : Array.isArray(data?.detail)
        ? data.detail.map((e) => e.msg).join(', ')
        : 'Request failed';
    throw new Error(message);
  }

  return data;
}

export const api = {
  login: (username, password) =>
    request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    }),

  logout: () => request('/auth/logout', { method: 'POST' }),

  me: () => request('/auth/me'),

  getTemplate: () => request('/forms/template'),

  submitForm: (data) =>
    request('/forms/submit', { method: 'POST', body: JSON.stringify(data) }),

  mySubmissions: () => request('/forms/my-submissions'),

  getSubmission: (id) => request(`/forms/submission/${id}`),

  adminSubmissions: () => request('/admin/submissions'),

  adminTemplate: () => request('/admin/template'),

  updateStyle: (style_config) =>
    request('/admin/template/style', {
      method: 'PUT',
      body: JSON.stringify({ style_config }),
    }),

  addField: (data) =>
    request('/admin/fields', { method: 'POST', body: JSON.stringify(data) }),

  updateField: (id, data) =>
    request(`/admin/fields/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteField: (id) =>
    request(`/admin/fields/${id}`, { method: 'DELETE' }),

  getUsers: () => request('/admin/users'),

  createUser: (data) =>
    request('/admin/users', { method: 'POST', body: JSON.stringify(data) }),

  updateUser: (id, data) =>
    request(`/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deactivateUser: (id) =>
    request(`/admin/users/${id}`, { method: 'DELETE' }),
};
