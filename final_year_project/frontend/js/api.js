// api.js — Central API Client
// Base URL for the Flask backend
const API_BASE_URL = 'http://127.0.0.1:5000';

/**
 * Universal API request helper.
 * Automatically attaches JWT 'token' from localStorage.
 *
 * @param {string} endpoint   - e.g. '/auth/login'
 * @param {string} method     - HTTP verb
 * @param {object|null} body  - Request payload (JSON)
 * @returns {Promise<any>}    - Parsed JSON response
 */
export async function apiRequest(endpoint, method = 'GET', body = null) {
    const url = `${API_BASE_URL}${endpoint}`;

    const headers = { 'Content-Type': 'application/json' };

    // Attach JWT token from localStorage (key: 'token')
    const token = localStorage.getItem('token');
    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const config = { method, headers };

    if (body && ['POST', 'PUT', 'PATCH'].includes(method)) {
        config.body = JSON.stringify(body);
    }

    try {
        const response = await fetch(url, config);

        // Token expired or invalid → clear and redirect
        if (response.status === 401) {
            clearAuthStorage();
            window.location.href = 'login.html';
            return null;
        }

        let data = null;
        try { data = await response.json(); } catch (_) {/* non-JSON ok */ }

        if (!response.ok) {
            const msg = data?.error || data?.message || `Request failed (${response.status})`;
            throw new Error(msg);
        }

        return data;
    } catch (error) {
        console.error(`[API] ${method} ${endpoint} →`, error.message);
        throw error;
    }
}

/** Wipe all auth-related localStorage keys */
export function clearAuthStorage() {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('username');
    localStorage.removeItem('user_id');
    localStorage.removeItem('user_email');
    // legacy keys — remove for safety
    localStorage.removeItem('penguin_jwt');
    localStorage.removeItem('penguin_user');
}
