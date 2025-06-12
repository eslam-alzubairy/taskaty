document.addEventListener('DOMContentLoaded', () => {

    // --- State Management ---
    let state = {
        projects: JSON.parse(localStorage.getItem('zenith-projects')) || [{ id: 'all', name: 'كل المهام' }],
        tasks: JSON.parse(localStorage.getItem('zenith-tasks')) || [],
        activeProjectId: 'all',
        theme: localStorage.getItem('zenith-theme') || 'light'
    };

    // --- DOM Elements ---
    const preloader = document.getElementById('preloader');
    const projectList = document.getElementById('project-list');
    const newProjectForm = document.getElementById('new-project-form');
    const newProjectInput = document.getElementById('new-project-input');
    const currentProjectTitle = document.getElementById('current-project-title');
    const taskList = document.getElementById('task-list');
    const taskForm = document.getElementById('task-form');
    const taskInput = document.getElementById('task-input');
    const themeSwitcher = document.getElementById('theme-switcher');

    // === CHART VARIABLES REMOVED ===

    // --- Utility Functions ---
    const saveState = () => {
        localStorage.setItem('zenith-projects', JSON.stringify(state.projects));
        localStorage.setItem('zenith-tasks', JSON.stringify(state.tasks));
        localStorage.setItem('zenith-theme', state.theme);
    };

    // --- Rendering Functions ---
    const renderProjects = () => {
        projectList.innerHTML = '';
        state.projects.forEach(project => {
            const li = document.createElement('li');
            li.className = `project-item ${project.id === state.activeProjectId ? 'active' : ''}`;
            li.dataset.id = project.id;
            li.textContent = project.name;
            if (project.id !== 'all') {
                const deleteBtn = document.createElement('i');
                deleteBtn.className = 'fas fa-times-circle delete-project-btn';
                deleteBtn.title = 'حذف المشروع ومهامه';
                li.appendChild(deleteBtn);
            }
            projectList.appendChild(li);
        });
        const activeProject = state.projects.find(p => p.id === state.activeProjectId);
        currentProjectTitle.textContent = activeProject ? activeProject.name : 'كل المهام';
    };

const renderTasks = () => {
    taskList.innerHTML = '';
    let tasksToRender = (state.activeProjectId === 'all')
        ? state.tasks
        : state.tasks.filter(task => task.projectId === state.activeProjectId);

    // === SORTING LOGIC ADDED HERE ===
    const priorityOrder = {
        'high': 1,
        'medium': 2,
        'low': 3
    };

    tasksToRender.sort((a, b) => {
        // أولاً، نرتب حسب حالة الإنجاز (المهام غير المكتملة تأتي أولاً)
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        // إذا كانت حالة الإنجاز متشابهة، نرتب حسب الأولوية
        return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
    // === END OF SORTING LOGIC ===

    if (tasksToRender.length === 0) {
        taskList.innerHTML = `<p class="empty-tasks" style="color: var(--text-secondary); text-align: center; padding: 20px;">لا توجد مهام في هذا المشروع.</p>`;
    } else {
        tasksToRender.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.dataset.id = task.id;
            li.innerHTML = `
                <div class="priority-indicator ${task.priority}"></div>
                <div class="task-content">
                    <div class="task-text"><h3>${task.text}</h3></div>
                </div>
                <div class="task-actions">
                    <button class="icon-btn complete-btn"><i class="fas ${task.completed ? 'fa-check-circle' : 'fa-check'}"></i></button>
                    <button class="icon-btn delete-btn"><i class="fas fa-trash"></i></button>
                </div>
            `;
            taskList.appendChild(li);
        });
    }
};

    // --- Event Handlers ---
    const addProject = (e) => {
        e.preventDefault();
        const name = newProjectInput.value.trim();
        if (name) {
            const newProject = { id: Date.now().toString(), name };
            state.projects.push(newProject);
            state.activeProjectId = newProject.id;
            newProjectInput.value = '';
            saveState();
            renderProjects();
            renderTasks();
        }
    };

    const addTask = (e) => {
        e.preventDefault();
        const text = taskInput.value.trim();
        const priority = document.querySelector('input[name="priority"]:checked').value;
        
        const currentProjectId = state.activeProjectId === 'all' ? null : state.activeProjectId;
        
        if (!currentProjectId) {
            alert('يرجى تحديد مشروع أولاً قبل إضافة مهمة.');
            return;
        }

        if (text) {
            const newTask = {
                id: Date.now().toString(),
                text,
                completed: false,
                priority,
                projectId: currentProjectId
            };
            state.tasks.push(newTask);
            taskForm.reset();
            document.querySelector('input[name="priority"][value="medium"]').checked = true;
            saveState();
            renderTasks();
        }
    };
    
    const handleProjectClick = (e) => {
        const target = e.target;
        if (target.matches('.project-item')) {
            state.activeProjectId = target.dataset.id;
        } else if (target.matches('.delete-project-btn')) {
            e.stopPropagation();
            const projectId = target.parentElement.dataset.id;
            if (confirm(`هل أنت متأكد من حذف هذا المشروع وكل مهامه؟`)) {
                state.projects = state.projects.filter(p => p.id !== projectId);
                state.tasks = state.tasks.filter(t => t.projectId !== projectId);
                state.activeProjectId = 'all';
            }
        } else {
            return;
        }
        saveState();
        renderProjects();
        renderTasks();
    };

    const handleTaskClick = (e) => {
        const taskItem = e.target.closest('.task-item');
        if (!taskItem) return;
        const taskId = taskItem.dataset.id;

        if (e.target.closest('.complete-btn')) {
            const task = state.tasks.find(t => t.id === taskId);
            if(task) task.completed = !task.completed;
        } else if (e.target.closest('.delete-btn')) {
            state.tasks = state.tasks.filter(t => t.id !== taskId);
        } else {
            return;
        }
        saveState();
        renderTasks();
    };

    const switchTheme = () => {
        state.theme = state.theme === 'light' ? 'dark' : 'light';
        document.body.className = state.theme + '-mode';
        themeSwitcher.innerHTML = state.theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        saveState();
    };

    // --- Initialization ---
    const init = () => {
        setTimeout(() => {
            preloader.style.opacity = '0';
            preloader.style.pointerEvents = 'none';
        }, 500);

        document.body.className = state.theme + '-mode';
        themeSwitcher.innerHTML = state.theme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
        
        newProjectForm.addEventListener('submit', addProject);
        taskForm.addEventListener('submit', addTask);
        projectList.addEventListener('click', handleProjectClick);
        taskList.addEventListener('click', handleTaskClick);
        themeSwitcher.addEventListener('click', switchTheme);
        
        renderProjects();
        renderTasks();
    };

    init();
});