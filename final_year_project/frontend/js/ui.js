// ui.js — Shared UI Utilities
import { logout } from './auth.js';

/* ───────────────────────────────────────────
   TOAST NOTIFICATIONS
─────────────────────────────────────────── */
let toastContainer = null;

function ensureToastContainer() {
    if (!toastContainer) {
        toastContainer = document.getElementById('toast-container');
        if (!toastContainer) {
            toastContainer = document.createElement('div');
            toastContainer.id = 'toast-container';
            document.body.appendChild(toastContainer);
        }
    }
}

export function showToast(message, type = 'info', duration = 3500) {
    ensureToastContainer();
    const icons = { success: '✓', error: '✕', info: 'ℹ' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `<span class="toast-icon">${icons[type] || 'ℹ'}</span><span>${message}</span>`;
    toastContainer.appendChild(toast);

    if (typeof gsap !== 'undefined') {
        gsap.fromTo(toast,
            { opacity: 0, y: 20, scale: 0.92 },
            { opacity: 1, y: 0, scale: 1, duration: 0.4, ease: 'back.out(1.5)' }
        );
        gsap.to(toast, {
            opacity: 0, y: -10, duration: 0.4, delay: duration / 1000,
            ease: 'power2.in', onComplete: () => toast.remove()
        });
    } else {
        setTimeout(() => toast.remove(), duration + 400);
    }
}

/* ───────────────────────────────────────────
   MODAL HELPERS
─────────────────────────────────────────── */
export function openModal(overlayId, boxId) {
    const overlay = document.getElementById(overlayId);
    const box = document.getElementById(boxId);
    if (!overlay || !box) return;
    overlay.classList.remove('hidden');
    overlay.style.display = 'flex';
    if (typeof gsap !== 'undefined') {
        gsap.fromTo(box, { scale: 0.88, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.35, ease: 'back.out(1.5)' });
    }
}

export function closeModal(overlayId, boxId, resetFormId) {
    const overlay = document.getElementById(overlayId);
    const box = document.getElementById(boxId);
    if (!overlay || !box) return;
    if (typeof gsap !== 'undefined') {
        gsap.to(box, {
            scale: 0.92, opacity: 0, duration: 0.25, ease: 'power2.in',
            onComplete: () => {
                overlay.style.display = 'none';
                overlay.classList.add('hidden');
                if (resetFormId) {
                    const f = document.getElementById(resetFormId);
                    if (f) f.reset();
                }
            }
        });
    } else {
        overlay.style.display = 'none';
        overlay.classList.add('hidden');
    }
}

/* ───────────────────────────────────────────
   ROLE-BASED SIDEBAR RENDERER
   Reads from canonical localStorage keys:
     token, role, username
─────────────────────────────────────────── */
export function renderSidebar(activePage) {
    // Read from canonical keys first, fall back to legacy penguin_user blob
    const role = localStorage.getItem('role')
        || JSON.parse(localStorage.getItem('penguin_user') || '{}').role
        || 'member';
    const name = localStorage.getItem('username')
        || JSON.parse(localStorage.getItem('penguin_user') || '{}').name
        || 'Commander';

    // Nav items — roles controls visibility per role
    const navItems = [
        { href: 'dashboard.html',    icon: '📊', label: 'Dashboard',    roles: 'all' },
        { href: 'projects.html',     icon: '📁', label: 'Projects',     roles: ['admin', 'manager'] },
        { href: 'tasks.html',        icon: '📋', label: 'My Tasks',     roles: 'all' },
        { href: 'team.html',         icon: '👥', label: 'Team',         roles: ['admin', 'manager'] },
        { href: 'leaderboard.html',  icon: '🏆', label: 'Leaderboard',  roles: 'all' },
        { href: 'badges.html',       icon: '🏅', label: 'Badges',       roles: 'all' },
        { href: 'ai-assistant.html', icon: '🤖', label: 'AI Assistant', roles: 'all' },
    ];

    const accountItems = [
        { href: 'profile.html', icon: '👤', label: 'Profile', roles: 'all' },
    ];

    const roleLabelMap = { admin: '⚡ Admin', manager: '🛡 Manager', member: '🐧 Member' };
    const roleClass    = { admin: 'admin',   manager: 'manager',    member: 'member' };

    const buildItem = (item) => {
        if (item.roles !== 'all' && !item.roles.includes(role)) return '';
        const active = activePage === item.href ? 'active' : '';
        return `<li><a href="${item.href}" class="nav-link ${active}" data-label="${item.label}">
            <span class="nav-icon">${item.icon}</span>
            <span>${item.label}</span>
        </a></li>`;
    };

    const avatarSeed = encodeURIComponent(name);

    return `
    <div style="position:relative;z-index:20;display:flex;flex-direction:column;height:100%">

        <!-- ── Top row: logo + toggle button ── -->
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:4px;padding-bottom:18px;border-bottom:1px solid rgba(79,200,255,0.08)">
            <a href="dashboard.html" class="sidebar-logo" style="margin-bottom:0;padding:0;border:none;flex:1;min-width:0">
                <div class="logo-icon" style="flex-shrink:0">🐧</div>
                <span class="sidebar-text" style="white-space:nowrap;overflow:hidden;transition:opacity 0.2s ease,max-width 0.3s ease;max-width:160px">PenguinOps</span>
            </a>
            <!-- Toggle button — id must match initSidebarToggle() -->
            <button id="sidebar-toggle-btn"
                    aria-label="Toggle sidebar"
                    style="
                        flex-shrink:0;
                        width:30px;height:30px;
                        border-radius:8px;
                        background:rgba(79,200,255,0.07);
                        border:1px solid rgba(79,200,255,0.15);
                        color:var(--neon-blue);
                        cursor:pointer;
                        font-size:1rem;
                        display:flex;align-items:center;justify-content:center;
                        transition:all 0.2s;
                        margin-left:6px;
                    ">
                &#9776;
            </button>
        </div>

        <div class="sidebar-user-info">
            <div class="sidebar-avatar">
                <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${avatarSeed}"
                     alt="Avatar" style="width:100%;height:100%;object-fit:cover">
            </div>
            <div style="min-width:0;flex:1;overflow:hidden">
                <div class="sb-name"
                     style="font-weight:600;font-size:0.85rem;white-space:nowrap;overflow:hidden;text-overflow:ellipsis"
                     id="sidebar-username">${name}</div>
                <div class="role-badge ${roleClass[role] || 'member'}"
                     style="margin-top:4px">${roleLabelMap[role] || '🐧 Member'}</div>
            </div>
        </div>

        <div style="flex:1;overflow-y:auto;overflow-x:hidden">
            <div class="sidebar-nav-label">Navigation</div>
            <ul class="nav-links">
                ${navItems.map(buildItem).join('')}
            </ul>

            <div class="sidebar-nav-label" style="margin-top:16px">Account</div>
            <ul class="nav-links">
                ${accountItems.map(buildItem).join('')}
                <li><a href="#" id="logout-btn" class="nav-link" data-label="Logout" style="color:#f87171">
                    <span class="nav-icon">🚪</span><span>Logout</span>
                </a></li>
            </ul>
        </div>
    </div>`;
}

/* ───────────────────────────────────────────
   INIT SIDEBAR — attach logout + toggle
─────────────────────────────────────────── */
export function initSidebar(activePage) {
    const el = document.getElementById('sidebar');
    if (el) {
        el.innerHTML = renderSidebar(activePage);

        // Restore collapsed state from storage
        const saved = localStorage.getItem('sb_collapsed');
        if (saved === 'true') el.classList.add('collapsed');

        // Logout button
        document.getElementById('logout-btn')?.addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });

        // Toggle button
        initSidebarToggle();
    }
}

/* ───────────────────────────────────────────
   SIDEBAR TOGGLE — collapse / expand
─────────────────────────────────────────── */
export function initSidebarToggle() {
    const btn     = document.getElementById('sidebar-toggle-btn');
    const sidebar = document.getElementById('sidebar');
    if (!btn || !sidebar) return;

    function setIcon(collapsed) {
        btn.innerHTML = collapsed
            ? '&#9776;'   // ☰ — also shows when collapsed to re-expand
            : '&#9776;';  // ☰ — hamburger both ways; could differ if desired
        btn.title = collapsed ? 'Expand sidebar' : 'Collapse sidebar';
    }

    setIcon(sidebar.classList.contains('collapsed'));

    btn.addEventListener('click', () => {
        const isNowCollapsed = sidebar.classList.toggle('collapsed');
        localStorage.setItem('sb_collapsed', isNowCollapsed);
        setIcon(isNowCollapsed);

        // Optional GSAP bounce on toggle icon
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(btn,
                { scale: 0.85 },
                { scale: 1, duration: 0.3, ease: 'back.out(2)' }
            );
        }
    });

    // Hover highlight
    btn.addEventListener('mouseenter', () => {
        btn.style.background   = 'rgba(79,200,255,0.15)';
        btn.style.borderColor  = 'rgba(79,200,255,0.4)';
    });
    btn.addEventListener('mouseleave', () => {
        btn.style.background   = 'rgba(79,200,255,0.07)';
        btn.style.borderColor  = 'rgba(79,200,255,0.15)';
    });
}
