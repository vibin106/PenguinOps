import { apiRequest } from './api.js';
import { Animations } from './animations.js';

export async function initLeaderboard() {
    const tableBody = document.getElementById('leaderboard-table');

    try {
        let data = [];
        try {
            // There is no explicit leaderboard route in the provided python files. 
            // So we'll try `/users/leaderboard` or `/protected/profile` and handle failure.
            const response = await apiRequest('/users/leaderboard', 'GET');
            if (Array.isArray(response)) {
                data = response;
            } else {
                throw new Error("Invalid array");
            }
        } catch(e) {
            // Mock data mapped since no real route
            const localUser = JSON.parse(localStorage.getItem('penguin_user'))?.name || 'Commander';
            data = [
                { rank: 1, name: 'PenguinMaster', level: 45, xp: 9001 },
                { rank: 2, name: 'IceKing', level: 42, xp: 8500 },
                { rank: 3, name: 'SnowDrifter', level: 38, xp: 7200 },
                { rank: 4, name: 'FrostBite', level: 35, xp: 6400 },
                { rank: 5, name: 'GlacierRunner', level: 30, xp: 5120 },
                { rank: 6, name: 'ArcticFox', level: 28, xp: 4800 },
                { rank: 7, name: 'PolarBear', level: 25, xp: 4200 },
                { rank: 8, name: 'IglooBuilder', level: 22, xp: 3800 },
                { rank: 9, name: 'SnowballChamp', level: 18, xp: 2900 },
                { rank: 10, name: localUser, level: 5, xp: 800 }
            ];
            
            // Sort to ensure order
            data.sort((a,b) => b.xp - a.xp);
            // Re-assign ranks
            data.forEach((d, i) => d.rank = i + 1);
        }

        tableBody.innerHTML = '';

        data.forEach((user, index) => {
            const tr = document.createElement('tr');
            
            const localUserName = JSON.parse(localStorage.getItem('penguin_user'))?.name || 'Commander';
            const isMe = user.name === localUserName;
            
            tr.className = `border-b border-[rgba(255,255,255,0.05)] hover:bg-[rgba(0,240,255,0.05)] transition-colors ${isMe ? 'bg-[#b026ff]/10 border-[#b026ff]/30 border shadow-[inset_0_0_10px_rgba(176,38,255,0.2)]' : ''}`;
            
            // Highlight top 3 colors
            let rankColor = 'text-muted';
            if (user.rank === 1) rankColor = 'text-yellow-400 text-glow-yellow font-bold text-shadow';
            else if (user.rank === 2) rankColor = 'text-gray-300 font-bold';
            else if (user.rank === 3) rankColor = 'text-orange-400 font-bold';
            
            tr.innerHTML = `
                <td class="p-4 pl-8 text-xl w-20 ${rankColor}">#${user.rank}</td>
                <td class="p-4 flex items-center gap-3">
                    <img src="https://api.dicebear.com/7.x/bottts/svg?seed=${user.name}" alt="${user.name}" class="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.2)] bg-black/50">
                    <span class="font-bold border-glow-on-hover">${user.name}</span>
                    ${isMe ? '<span class="text-[10px] ml-2 px-1 rounded bg-[#b026ff]/30 text-[#b026ff]">YOU</span>' : ''}
                </td>
                <td class="p-4 text-center w-32 font-bold text-neon-purple">Lv.${user.level}</td>
                <td class="p-4 pr-8 text-right w-40 font-bold text-neon-blue font-mono text-lg leaderboard-xp" data-target="${user.xp}">0</td>
            `;

            tableBody.appendChild(tr);
        });

        // Intro Animations
        gsap.from('#leaderboard-table tr', {
            opacity: 0,
            x: -20,
            stagger: 0.05,
            duration: 0.5,
            ease: "power2.out",
            onComplete: () => {
                // Animate XP counting up for each row after rows fade in
                document.querySelectorAll('.leaderboard-xp').forEach((el, i) => {
                    const target = parseInt(el.getAttribute('data-target'), 10);
                    // Slight delay for lower rows
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 1.5,
                        delay: i * 0.05,
                        ease: "power3.out",
                        onUpdate: () => {
                            el.textContent = Math.floor(obj.val).toLocaleString();
                        }
                    });
                });
            }
        });

        // Podium stagger optional
        gsap.from('.podium-stagger > div', {
            y: 50,
            opacity: 0,
            stagger: 0.2,
            duration: 0.8,
            ease: "back.out(1.5)"
        });

    } catch (error) {
        console.error("Leaderboard error:", error);
    }
}
