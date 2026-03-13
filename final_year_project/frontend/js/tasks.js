import { apiRequest } from './api.js';
import { Animations } from './animations.js';

export async function initTasks() {
    let tasks = [];
    let draggedTask = null;

    // Load Tasks
    const fetchTasks = async () => {
        try {
            // For now, load tasks spanning all projects if no specific project specified,
            // but the backend only supports GET /tasks/project/{project_id}.
            // So we'll fetch a dummy one or you can filter by select.
            const projectSelector = document.getElementById('task-project') || document.getElementById('project-filter');
            const project_id = projectSelector ? projectSelector.value || "60b8d295f1d2b270a0000000" : "60b8d295f1d2b270a0000000";
            
            const data = await apiRequest(`/tasks/project/${project_id}`, 'GET');
            tasks = Array.isArray(data) ? data : [];
            renderKanban();
        } catch (error) {
            console.error(error);
            alert("API Error: Fetching tasks failed.");
        }
    };

    const renderKanban = () => {
        const columns = ['pending', 'in_progress', 'completed']; // Mapping to backend state
        
        columns.forEach(status => {
            // Map frontend IDs
            let frontendStatusId = status;
            if (status === 'pending') frontendStatusId = 'todo';
            if (status === 'in_progress') frontendStatusId = 'inprogress';
            
            const list = document.getElementById(`list-${frontendStatusId}`);
            const count = document.getElementById(`count-${frontendStatusId}`);
            if(!list) return;

            const colTasks = tasks.filter(t => t.status === status || t.status === frontendStatusId);
            
            list.innerHTML = '';
            count.textContent = colTasks.length;

            colTasks.forEach(task => {
                const el = document.createElement('div');
                el.className = 'task-card';
                el.draggable = true;
                el.dataset.id = task.id || task._id;
                
                el.innerHTML = `
                    <div class="flex justify-between items-start mb-2">
                        <span class="text-xs font-bold text-glow-blue bg-[rgba(0,240,255,0.1)] px-2 py-1 rounded">XP: ${task.xp_reward || 10}</span>
                        <button class="text-red-400 hover:text-red-500 text-xs px-2 delete-task-btn" data-id="${task.id || task._id}">✕</button>
                    </div>
                    <div class="font-bold mb-1">${task.title}</div>
                    <div class="text-sm text-muted">${task.desc || ''}</div>
                `;

                // Drag Events
                el.addEventListener('dragstart', (e) => {
                    draggedTask = el;
                    e.dataTransfer.setData('text/plain', task.id || task._id);
                    setTimeout(() => el.style.opacity = '0.5', 0);
                });

                el.addEventListener('dragend', () => {
                    el.style.opacity = '1';
                    draggedTask = null;
                });

                list.appendChild(el);
            });
        });

        // Attach delete listeners
        document.querySelectorAll('.delete-task-btn').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = e.target.getAttribute('data-id');
                if (confirm('Delete this task?')) {
                    try {
                        await apiRequest(`/tasks/${id}`, 'DELETE');
                        fetchTasks();
                    } catch(error) {
                        alert("API Error: Failed to delete task. Endpoint might not exist.");
                    }
                }
            });
        });

        Animations.staggerCards('.task-card');
    };

    // Initialize Drop Zones
    document.querySelectorAll('.kanban-column').forEach(col => {
        const list = col.querySelector('.kanban-tasks');
        
        col.addEventListener('dragover', e => {
            e.preventDefault(); // allow drop
            col.style.background = 'rgba(25, 28, 41, 0.8)';
            col.style.borderColor = 'var(--neon-blue)';
        });

        col.addEventListener('dragleave', e => {
            col.style.background = '';
            col.style.borderColor = '';
        });

        col.addEventListener('drop', async e => {
            e.preventDefault();
            col.style.background = '';
            col.style.borderColor = '';
            
            const taskId = e.dataTransfer.getData('text/plain');
            let newStatusHtml = col.dataset.status; // frontend format
            
            // Map frontend status back back to backend expected
            let newStatus = newStatusHtml;
            if(newStatusHtml === 'todo') newStatus = 'pending';
            if(newStatusHtml === 'inprogress') newStatus = 'in_progress';
            
            const taskIndex = tasks.findIndex(t => (t.id || t._id) === taskId);
            if (taskIndex > -1 && tasks[taskIndex].status !== newStatus) {
                const oldStatus = tasks[taskIndex].status;
                tasks[taskIndex].status = newStatus;
                
                // Optimistic Update
                renderKanban(); 

                // API Update
                try {
                    await apiRequest(`/tasks/${taskId}/status`, 'PUT', { status: newStatus });
                } catch(error) {
                    alert("API Update Failed");
                    fetchTasks(); // refresh to revert
                }
            }
        });
    });

    const modal = document.getElementById('task-modal');
    const modalContent = document.getElementById('task-modal-content');

    document.getElementById('open-task-modal').addEventListener('click', () => {
        modal.classList.remove('hidden');
        gsap.to(modalContent, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(1.7)' });
    });

    const closeModal = () => {
        gsap.to(modalContent, { opacity: 0, scale: 0.95, duration: 0.2, onComplete: () => {
            modal.classList.add('hidden');
            document.getElementById('create-task-form').reset();
        }});
    };

    document.getElementById('close-task-modal').addEventListener('click', closeModal);

    document.getElementById('create-task-form').addEventListener('submit', async e => {
        e.preventDefault();
        const title = document.getElementById('task-title').value;
        const description = document.getElementById('task-desc').value;
        const xp_reward = parseInt(document.getElementById('task-xp').value, 10);
        // Default testing project ID if the combo is null
        const projectIdInput = document.getElementById('task-project').value || "60b8d295f1d2b270a0000000";

        try {
            await apiRequest('/tasks/', 'POST', { 
                title, 
                description, 
                xp_reward, 
                project_id: projectIdInput 
            });
            closeModal();
            fetchTasks();
        } catch(error) {
            alert("API logic failed during task creation request.");
        }
    });

    fetchTasks();
}
