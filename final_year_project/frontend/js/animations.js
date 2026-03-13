// animations.js — GSAP Animation Library

export const Animations = {

    // Page entrance fade
    pageTransition(selector = '.main-content') {
        if (typeof gsap === 'undefined') return;
        gsap.fromTo(selector,
            { opacity: 0, y: 16 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power3.out' }
        );
    },

    // Stagger cards (entry animation)
    staggerCards(selector, delay = 0) {
        if (typeof gsap === 'undefined') return;
        const els = document.querySelectorAll(selector);
        if (!els.length) return;
        gsap.fromTo(els,
            { opacity: 0, y: 24, scale: 0.96 },
            { opacity: 1, y: 0, scale: 1, duration: 0.55, stagger: 0.08, delay, ease: 'power2.out' }
        );
    },

    // Floating penguin
    floatPenguin(selector = '.penguin-mascot') {
        if (typeof gsap === 'undefined') return;
        const el = document.querySelector(selector);
        if (!el) return;
        gsap.to(el, { y: -10, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
    },

    // Animated number counter
    countUp(selector, end, prefix = '', suffix = '', duration = 1.8) {
        if (typeof gsap === 'undefined') {
            const el = document.querySelector(selector);
            if (el) el.textContent = prefix + end + suffix;
            return;
        }
        const el = document.querySelector(selector);
        if (!el) return;
        const obj = { val: 0 };
        gsap.to(obj, {
            val: end,
            duration,
            ease: 'power2.out',
            onUpdate() { el.textContent = prefix + Math.floor(obj.val).toLocaleString() + suffix; }
        });
    },

    // XP bar fill
    fillXPBar(selector, percent, glowColor = '#a855f7') {
        const el = document.querySelector(selector);
        if (!el) return;
        el.style.width = '0%';
        if (typeof gsap !== 'undefined') {
            gsap.to(el, { width: `${percent}%`, duration: 1.6, ease: 'power3.out', delay: 0.3 });
        } else {
            el.style.width = `${percent}%`;
        }
    },

    // Pulse glow effect on element
    pulseGlow(selector, color = 'rgba(0,240,255,0.5)') {
        if (typeof gsap === 'undefined') return;
        gsap.to(selector, {
            boxShadow: `0 0 28px ${color}`,
            duration: 0.8, repeat: -1, yoyo: true, ease: 'sine.inOut'
        });
    },

    // Sidebar nav link hover
    initNavGlow() {
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('mouseenter', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(link, { x: 4, duration: 0.18, ease: 'power1.out' });
                }
            });
            link.addEventListener('mouseleave', () => {
                if (typeof gsap !== 'undefined') {
                    gsap.to(link, { x: 0, duration: 0.18, ease: 'power1.out' });
                }
            });
        });
    }
};
