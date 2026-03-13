// penguin-guide.js

const guideSteps = [
    { title: 'Welcome to PenguinOps! 🐧', text: "I'm your AI-powered guide. Together we'll conquer every mission." },
    { title: 'Create a Project', text: "Managers can create new missions from the Projects page in the sidebar." },
    { title: 'Build the Kanban', text: "Add tasks and drag them across Todo → In Progress → Done." },
    { title: 'Earn XP & Level Up', text: "Each task you complete earns XP. Watch your rank climb the leaderboard!" },
    { title: 'Ask PenguinAI', text: "Stuck? Open the AI Assistant and ask me anything about your tasks or team." },
];

export class PenguinGuide {
    constructor() {
        this.step = 0;
        this.visible = false;
        this.completed = localStorage.getItem('penguin_guide_done') === 'true';
        if (!this.completed) this._init();
    }

    _init() {
        // Create container if absent
        let el = document.getElementById('penguin-guide');
        if (!el) {
            el = document.createElement('div');
            el.id = 'penguin-guide';
            document.body.appendChild(el);
        }

        el.innerHTML = `
            <div class="speech-bubble" id="pg-bubble">
                <div class="guide-title" id="pg-title"></div>
                <div class="guide-step"  id="pg-text"></div>
                <div class="guide-actions">
                    <button class="guide-btn"         id="pg-skip">Skip tour</button>
                    <button class="guide-btn primary" id="pg-next">Next →</button>
                </div>
            </div>
            <img
                src="assets/penguin.svg"
                alt="PenguinOps Guide"
                class="penguin-mascot"
                id="pg-mascot"
                onerror="this.src='https://api.dicebear.com/7.x/bottts/svg?seed=PenguinOps'"
            >
        `;

        this.bubble  = document.getElementById('pg-bubble');
        this.titleEl = document.getElementById('pg-title');
        this.textEl  = document.getElementById('pg-text');
        this.mascot  = document.getElementById('pg-mascot');

        document.getElementById('pg-skip').addEventListener('click', () => this._finish());
        document.getElementById('pg-next').addEventListener('click', () => this._next());
        this.mascot.addEventListener('click', () => this._toggle());

        // Float mascot
        if (typeof gsap !== 'undefined') {
            gsap.to(this.mascot, { y: -10, duration: 1.8, repeat: -1, yoyo: true, ease: 'sine.inOut' });
        }

        // Show bubble after brief delay
        setTimeout(() => this._show(), 1800);
    }

    _update() {
        const s = guideSteps[this.step];
        this.titleEl.textContent = s.title;
        this.textEl.textContent  = s.text;
        const btn = document.getElementById('pg-next');
        if (btn) btn.textContent = this.step === guideSteps.length - 1 ? 'Got it! ✓' : 'Next →';
    }

    _show() {
        this.bubble.classList.add('active');
        this.visible = true;
        this._update();
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(this.bubble,
                { opacity: 0, scale: 0.8, y: 12 },
                { opacity: 1, scale: 1,   y: 0,  duration: 0.4, ease: 'back.out(1.7)' }
            );
        }
    }

    _hide() {
        if (typeof gsap !== 'undefined') {
            gsap.to(this.bubble, {
                opacity: 0, scale: 0.85, duration: 0.25, ease: 'power2.in',
                onComplete: () => { this.bubble.classList.remove('active'); this.visible = false; }
            });
        } else {
            this.bubble.classList.remove('active');
            this.visible = false;
        }
    }

    _toggle() { this.visible ? this._hide() : this._show(); }

    _next() {
        this.step++;
        if (this.step >= guideSteps.length) { this._finish(); return; }
        if (typeof gsap !== 'undefined') {
            gsap.fromTo(this.bubble, { opacity: 0, x: 10 }, { opacity: 1, x: 0, duration: 0.3 });
        }
        this._update();
    }

    _finish() {
        localStorage.setItem('penguin_guide_done', 'true');
        this._hide();
    }

    // Call to reset the guide (useful for dev)
    reset() {
        localStorage.removeItem('penguin_guide_done');
        this.step = 0;
        this.completed = false;
        this._show();
    }
}
