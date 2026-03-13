import { apiRequest } from './api.js';
import { Animations } from './animations.js';

export async function initDashboard() {
    try {
        const userDataString = localStorage.getItem('penguin_user');
        let userName = 'Commander';
        let level = 1;
        let xp = 0;

        if (userDataString) {
            const user = JSON.parse(userDataString);
            userName = user.name || userName;
        }

        const dashboardData = {
            name: userName,
            xp: xp,
            level: level,
            completedTasks: 0,
            activeProjects: 0,
            rank: 1,
            xpToNextLevel: 100,
            recentActivity: [],
            topUsers: [],
            chartData: [0, 0, 0, 0, 0, 0, 0]
        };

        try {
            // Check protected profile route
            const pData = await apiRequest('/protected/profile', 'GET');
            if(pData && pData.email) {
                // successfully validated token
            }
        } catch(e) {}

        // Mocking some parts since backend doesn't seem to have a `/users/dashboard` route natively based on search
        try {
            // Attempt to fetch projects manually to get count
            const pData = await apiRequest('/projects/', 'GET');
            if(Array.isArray(pData)) dashboardData.activeProjects = pData.length;
        } catch(e) {}

        // Update UI Elements
        document.getElementById('user-initial-name').textContent = dashboardData.name;
        document.getElementById('user-level').textContent = dashboardData.level;
        document.getElementById('current-level-display').textContent = dashboardData.level;
        
        // Progress Bars
        const xpPercentage = Math.min((dashboardData.xp / dashboardData.xpToNextLevel) * 100, 100);
        document.getElementById('xp-progress-text').textContent = `${dashboardData.xp}/${dashboardData.xpToNextLevel}`;
        
        setTimeout(() => {
            document.getElementById('xp-bar-header').style.width = `${xpPercentage}%`;
            document.getElementById('main-xp-bar').style.width = `${xpPercentage}%`;
        }, 500);

        // Stats Counter Animation
        Animations.countUp('#stat-xp', 0, dashboardData.xp);
        Animations.countUp('#stat-projects', 0, dashboardData.activeProjects);
        Animations.countUp('#stat-tasks', 0, dashboardData.completedTasks);
        document.getElementById('stat-rank').textContent = `#${dashboardData.rank}`;

        // Leaderboard Preview
        const leaderboardList = document.getElementById('leaderboard-preview');
        leaderboardList.innerHTML = '';
        if(dashboardData.topUsers.length === 0) {
            leaderboardList.innerHTML = '<li class="text-center text-muted text-sm">No leaderboard data found</li>';
        } else {
            dashboardData.topUsers.forEach((user, index) => {
                const li = document.createElement('li');
                li.className = "flex justify-between items-center bg-[rgba(255,255,255,0.05)] p-3 rounded-xl border border-[rgba(255,255,255,0.05)]";
                li.innerHTML = `
                    <div class="flex items-center gap-3">
                        <span class="text-xl font-bold ${index === 0 ? 'text-yellow-400' : index === 1 ? 'text-gray-300' : index === 2 ? 'text-orange-400' : 'text-muted'}">#${index + 1}</span>
                        <div>
                            <div class="font-bold text-sm">${user.name}</div>
                            <div class="text-xs text-muted">${user.title}</div>
                        </div>
                    </div>
                    <div class="text-right">
                        <div class="text-neon-blue font-bold">${user.xp}</div>
                        <div class="text-xs text-muted">XP</div>
                    </div>
                `;
                leaderboardList.appendChild(li);
            });
        }

        // Initialize Chart.js
        const ctx = document.getElementById('activityChart').getContext('2d');
        
        // Setup Gradient
        const gradient = ctx.createLinearGradient(0, 0, 0, 400);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.5)');
        gradient.addColorStop(1, 'rgba(176, 38, 255, 0.0)');

        new Chart(ctx, {
            type: 'line',
            data: {
                labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                datasets: [{
                    label: 'Tasks Completed',
                    data: dashboardData.chartData,
                    borderColor: '#00f0ff',
                    backgroundColor: gradient,
                    borderWidth: 3,
                    pointBackgroundColor: '#b026ff',
                    pointBorderColor: '#fff',
                    pointHoverBackgroundColor: '#fff',
                    pointHoverBorderColor: '#00f0ff',
                    fill: true,
                    tension: 0.4 // Smooth curves
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(15, 17, 26, 0.9)',
                        titleColor: '#00f0ff',
                        bodyColor: '#fff',
                        borderColor: 'rgba(0, 240, 255, 0.3)',
                        borderWidth: 1,
                        padding: 10,
                        displayColors: false,
                        callbacks: {
                            label: function(context) {
                                return context.parsed.y + ' Tasks';
                            }
                        }
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: 'rgba(255, 255, 255, 0.05)',
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8b92a5'
                        }
                    },
                    x: {
                        grid: {
                            display: false,
                            drawBorder: false
                        },
                        ticks: {
                            color: '#8b92a5'
                        }
                    }
                },
                animation: {
                    duration: 2000,
                    easing: 'easeOutQuart'
                }
            }
        });

        Animations.staggerCards('.stats-container > div');

    } catch (error) {
        console.error("Dashboard init error:", error);
    }
}
