import { apiRequest } from './api.js';
import { Animations } from './animations.js';

export async function initProjects() {
    const container = document.getElementById('projects-container');
    const loading = document.getElementById('projects-loading');
    const modal = document.getElementById('create-modal');
    const modalContent = document.getElementById('modal-content');

    let projects = [];

    // Load Projects
    const fetchProjects = async () => {
        try {
            const data = await apiRequest('/projects/', 'GET');
            projects = Array.isArray(data) ? data : [];
            renderProjects();
        } catch (error) {
            console.error("Failed to fetch projects:", error);
            if (loading) loading.textContent = "Error loading missions.";
            alert("API Error: Failed to fetch projects");
        }
    };

    // Render Projects
    const renderProjects = () => {
        if (!container) return;
        
        container.innerHTML = '';
        if (projects.length === 0) {
            container.innerHTML = `<div class="text-center w-full col-span-full py-20 text-muted">No active missions. Start one!</div>`;
            return;
        }

        projects.forEach(project => {
            const card = document.createElement('div');
            card.className = "glass-card p-6 flex flex-col justify-between project-card";
            card.innerHTML = `
                <div>
                    <div class="flex justify-between items-start mb-4">
                        <h3 class="text-xl font-bold brand-font text-glow-blue">${project.name}</h3>
                        <button class="delete-btn text-red-400 hover:text-red-500 transition-colors" data-id="${project.id || project._id}">🗑️</button>
                    </div>
                    <p class="text-muted text-sm mb-6">${project.description || 'No description provided.'}</p>
                </div>
                <div>
                    <div class="flex justify-between text-xs text-muted mb-2">
                        <span>Status</span>
                        <span class="text-neon-purple uppercase font-bold">${project.status || 'Active'}</span>
                    </div>
                    <div class="w-full h-2 bg-black bg-opacity-50 rounded-full overflow-hidden mb-4">
                        <div class="h-full bg-gradient-to-r from-neon-blue to-neon-purple w-full"></div>
                    </div>
                    <a href="tasks.html?project=${project.id || project._id}" class="btn-outline w-full text-center block text-sm">View Intel</a>
                </div>
            `;
            container.appendChild(card);
        });

        // Add delete listeners
        document.querySelectorAll('.delete-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.currentTarget.getAttribute('data-id');
                if (confirm('Are you sure you want to abort this mission?')) {
                    await deleteProject(id);
                }
            });
        });

        Animations.staggerCards('.project-card');
    };

    // Create Project
    document.getElementById('create-project-form')?.addEventListener('submit', async (e) => {
        e.preventDefault();
        const name = document.getElementById('project-name').value;
        const description = document.getElementById('project-desc').value;

        // Since backend requires team_id as well, passing a hardcoded dummy or empty might fail,
        // let's pass a dummy string for now, since it requires ObjectId or similar.
        // The project_routes says "team_id = data.get('team_id')". We should try sending team_id: "global" or something.
        const dummyTeamId = "60b8d295f1d2b270a0000000";

        try {
            await apiRequest('/projects/', 'POST', { name, description, team_id: dummyTeamId });
            closeModal();
            fetchProjects();
        } catch(error) {
            console.error("Create project error:", error);
            alert("API Error: Failed to create project. " + error.message);
        }
    });

    // Delete Project
    const deleteProject = async (id) => {
        try {
            await apiRequest(`/projects/${id}`, 'DELETE');
            fetchProjects();
        } catch(error) {
            console.error("Delete project error:", error);
            alert("API Error: Could not delete project. This endpoint might not exist in the backend yet.");
        }
    };

    // Modal Logic
    const openModal = () => {
        modal.classList.remove('hidden');
        void modal.offsetWidth; 
        gsap.to(modalContent, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    };

    const closeModal = () => {
        gsap.to(modalContent, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => {
            modal.classList.add('hidden');
            document.getElementById('create-project-form').reset();
        }});
    };

    document.getElementById('open-create-modal')?.addEventListener('click', openModal);
    document.getElementById('close-modal')?.addEventListener('click', closeModal);

    fetchProjects();
}
