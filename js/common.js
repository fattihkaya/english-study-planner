// common.js
// Global state yönetimi
const state = {
    currentView: 'weekly',
    currentDay: 'pazartesi',
    currentModal: null,
    tasks: {}
};

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeView();
    renderWeeklyView();
});

// Event listener'ları kur
function setupEventListeners() {
    // Tab değişim olayları
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const view = btn.dataset.view;
            switchView(view);
        });
    });

    // Modal dışına tıklama ile kapatma
    window.onclick = (event) => {
        if (event.target.classList.contains('modal')) {
            closeModal(event.target.id);
        }
    };

    // ESC tuşu ile modal kapatma
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeAllModals();
        }
    });

    // Görev formu submit
    const taskForm = document.getElementById('taskForm');
    if (taskForm) {
        taskForm.addEventListener('submit', handleTaskSubmit);
    }
}

// Görünüm değiştirme
function switchView(view) {
    // Tüm view'ları gizle
    document.querySelectorAll('.view-content').forEach(content => {
        content.classList.remove('active');
    });

    // Seçili view'ı göster
    const selectedView = document.getElementById(`${view}-view`);
    if (selectedView) {
        selectedView.classList.add('active');
        state.currentView = view;
    }

    // Tab butonlarını güncelle
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`[data-view="${view}"]`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

// Haftalık görünümü oluştur
function renderWeeklyView() {
    const weeklyPlan = document.querySelector('.weekly-plan');
    if (!weeklyPlan) return;

    const days = ['pazartesi', 'salı', 'çarşamba', 'perşembe', 'cuma'];
    const timeBlocks = ['sabah', 'öğle', 'akşam'];

    weeklyPlan.innerHTML = days.map(day => `
        <div class="day-card">
            <div class="day-header">
                <h2>${day.charAt(0).toUpperCase() + day.slice(1)}</h2>
                <button class="add-btn" onclick="openAddTaskModal('${day}')">+</button>
            </div>
            ${timeBlocks.map(time => `
                <div class="time-block">
                    <h3>${time.charAt(0).toUpperCase() + time.slice(1)}</h3>
                    <div id="${day}-${time}-tasks" class="tasks-container">
                        ${renderTasks(day, time)}
                    </div>
                </div>
            `).join('')}
        </div>
    `).join('');
}

// Görevleri render et
function renderTasks(day, time) {
    const tasks = state.tasks[day]?.[time] || [];
    return tasks.map(task => `
        <div class="task-item ${task.completed ? 'completed' : ''}" data-id="${task.id}">
            <input type="checkbox" class="task-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-title">${task.title}</div>
                <div class="task-duration">${task.duration} dk</div>
            </div>
            <button class="delete-btn">×</button>
        </div>
    `).join('') || 'Görev yok';
}

// Görev ekleme
function handleTaskSubmit(e) {
    e.preventDefault();
    const formData = new FormData(e.target);
    const task = {
        id: Date.now(),
        title: formData.get('title'),
        time: formData.get('time'),
        duration: parseInt(formData.get('duration')),
        completed: false
    };

    const day = formData.get('day');
    
    if (!state.tasks[day]) {
        state.tasks[day] = {};
    }
    if (!state.tasks[day][task.time]) {
        state.tasks[day][task.time] = [];
    }
    
    state.tasks[day][task.time].push(task);
    
    closeModal('taskModal');
    renderWeeklyView();
    showNotification('Görev eklendi');
}

// Modal işlemleri
function openAddTaskModal(day) {
    state.currentDay = day;
    const modal = document.getElementById('taskModal');
    if (modal) {
        document.getElementById('taskDay').value = day;
        document.getElementById('taskForm').reset();
        showModal('taskModal');
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        state.currentModal = modalId;
    }
}

function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        const form = modal.querySelector('form');
        if (form) {
            form.reset();
        }
        state.currentModal = null;
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        closeModal(modal.id);
    });
}

// Bildirimler
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Yardımcı fonksiyonlar
function initializeView() {
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'weekly';
    switchView(view);
}