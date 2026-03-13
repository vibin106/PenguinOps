// auth.js — Authentication & Route Guard
import { apiRequest, clearAuthStorage } from './api.js';

/* ──────────────────────────────────────────────────────────
   STORAGE KEYS  (single source of truth)
   ────────────────────────────────────────────────────────── */
const KEY_TOKEN    = 'token';
const KEY_ROLE     = 'role';
const KEY_USERNAME = 'username';
const KEY_USER_ID  = 'user_id';
const KEY_EMAIL    = 'user_email';

/* ──────────────────────────────────────────────────────────
   STEP 1 — loginUser(email, password)
   - POST /auth/login
   - Stores token, role, username in localStorage
   - Redirects to dashboard.html on success
   ────────────────────────────────────────────────────────── */
export async function loginUser(email, password) {
    const data = await apiRequest('/auth/login', 'POST', { email, password });

    if (!data || !data.access_token) {
        throw new Error('Invalid response from server — no token received.');
    }

    // ── Persist auth data ──
    localStorage.setItem(KEY_TOKEN,    data.access_token);
    localStorage.setItem(KEY_ROLE,     data.user?.role     ?? 'member');
    localStorage.setItem(KEY_USERNAME, data.user?.name     ?? 'Commander');
    localStorage.setItem(KEY_USER_ID,  data.user?.id       ?? '');
    localStorage.setItem(KEY_EMAIL,    data.user?.email    ?? email);

    // Store full user blob for convenience (ui.js sidebar)
    localStorage.setItem('penguin_user', JSON.stringify({
        id:    data.user?.id    ?? '',
        name:  data.user?.name  ?? 'Commander',
        email: data.user?.email ?? email,
        role:  data.user?.role  ?? 'member',
    }));

    // Redirect to dashboard
    window.location.href = 'dashboard.html';
}

/* ──────────────────────────────────────────────────────────
   STEP 2 — handleLogin()
   Called directly from login.html submit button
   ────────────────────────────────────────────────────────── */
export async function handleLogin() {
    const emailEl    = document.getElementById('email');
    const passwordEl = document.getElementById('password');
    const errorEl    = document.getElementById('error-text');
    const errorDiv   = document.getElementById('error-banner');
    const btn        = document.getElementById('login-btn');
    const btnText    = document.getElementById('btn-text');

    const email    = emailEl?.value.trim()    ?? '';
    const password = passwordEl?.value.trim() ?? '';

    if (!email || !password) {
        _showError('Please enter both email and password.');
        return;
    }

    if (btn)     btn.disabled         = true;
    if (btnText) btnText.textContent  = 'Authenticating…';
    if (errorDiv) errorDiv.style.display = 'none';

    try {
        await loginUser(email, password);
        // loginUser redirects on success — nothing more needed here
    } catch (err) {
        _showError(err.message || 'Login failed. Check your credentials.');
        if (btn)     btn.disabled        = false;
        if (btnText) btnText.textContent = 'Sign In →';
    }

    function _showError(msg) {
        if (errorEl)  errorEl.textContent   = msg;
        if (errorDiv) errorDiv.style.display = 'flex';
    }
}

/* ──────────────────────────────────────────────────────────
   STEP 3 — protectRoute()
   Call at top of every protected page.
   Redirects to login.html if no token found.
   ────────────────────────────────────────────────────────── */
export function protectRoute() {
    const PUBLIC_PAGES = ['login.html', 'register.html', 'index.html', ''];
    const page = window.location.pathname.split('/').pop() || 'index.html';

    const hasToken = !!localStorage.getItem(KEY_TOKEN);

    if (!hasToken && !PUBLIC_PAGES.includes(page)) {
        window.location.replace('login.html');
        return false;
    }

    // Already logged-in users visiting login/register → push to dashboard
    if (hasToken && (page === 'login.html' || page === 'register.html')) {
        window.location.replace('dashboard.html');
        return false;
    }

    return true;
}

/* ──────────────────────────────────────────────────────────
   STEP 4 — applyRoleUI()
   Hides/shows elements based on localStorage role.
   Manager  → sees .manager-only elements
   Member   → sees .member-only elements
   ────────────────────────────────────────────────────────── */
export function applyRoleUI() {
    const role      = localStorage.getItem(KEY_ROLE) || 'member';
    const isManager = role === 'manager' || role === 'admin';

    // Show manager elements
    document.querySelectorAll('.manager-only').forEach(el => {
        el.classList.toggle('hidden', !isManager);
    });

    // Show member elements
    document.querySelectorAll('.member-only').forEach(el => {
        el.classList.toggle('hidden', isManager);
    });

    // Show any role-specific welcome badge
    document.querySelectorAll('[data-role-badge]').forEach(el => {
        el.textContent = isManager ? '🛡 Manager' : '🐧 Member';
        el.className   = `role-badge ${isManager ? 'manager' : 'member'}`;
    });
}

/* ──────────────────────────────────────────────────────────
   STEP 5 — logout()
   Clears all auth keys, redirects to login.html
   ────────────────────────────────────────────────────────── */
export function logout() {
    clearAuthStorage();
    window.location.href = 'login.html';
}

/* ──────────────────────────────────────────────────────────
   STEP 6 — displayUsername()
   Writes "Welcome <name>" into elements with id="username"
   or class="welcome-username"
   ────────────────────────────────────────────────────────── */
export function displayUsername() {
    const name = localStorage.getItem(KEY_USERNAME) || 'Commander';

    const el = document.getElementById('username');
    if (el) el.innerText = 'Welcome ' + name;

    document.querySelectorAll('.welcome-username').forEach(e => {
        e.textContent = 'Welcome ' + name;
    });
}

/* ──────────────────────────────────────────────────────────
   CONVENIENCE GETTERS
   ────────────────────────────────────────────────────────── */
export function getToken()    { return localStorage.getItem(KEY_TOKEN); }
export function getRole()     { return localStorage.getItem(KEY_ROLE) || 'member'; }
export function getUsername() { return localStorage.getItem(KEY_USERNAME) || 'Commander'; }
export function isManager()   { const r = getRole(); return r === 'manager' || r === 'admin'; }
export function isLoggedIn()  { return !!getToken(); }

/* ──────────────────────────────────────────────────────────
   LEGACY COMPAT — Auth object (used by older page scripts)
   ────────────────────────────────────────────────────────── */
export const Auth = {
    isAuthenticated: isLoggedIn,
    login:           loginUser,
    logout,
    protectRoute,
    applyRoleUI,
    displayUsername,
    getRole,
    getUsername,
    isManager,
};

// Auto-run route protection when this module is loaded
protectRoute();
