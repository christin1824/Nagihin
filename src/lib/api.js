import { auth } from './firebase';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

async function request(path, options = {}) {
  const token = auth?.currentUser ? await auth.currentUser.getIdToken() : null;
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Permintaan ke server gagal.');
  return body;
}

export function getCollection(collectionName, params = {}) {
  const search = new URLSearchParams(params).toString();
  return request(`/collections/${collectionName}${search ? `?${search}` : ''}`);
}

export function createDocument(collectionName, data) {
  return request(`/collections/${collectionName}`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export function updateDocument(collectionName, id, data) {
  return request(`/collections/${collectionName}/${encodeURIComponent(id)}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export function deleteDocument(collectionName, id) {
  return request(`/collections/${collectionName}/${encodeURIComponent(id)}`, {
    method: 'DELETE',
  });
}

export function batchUpdate(collectionName, items) {
  return request(`/collections/${collectionName}/batch`, {
    method: 'POST',
    body: JSON.stringify({ items }),
  });
}

export function getCurrentProfile() {
  return request('/me');
}
