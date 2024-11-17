// Veri yapısı
let planData = {
    tasks: [],
    notes: [],
    progress: {
        weeklyGoal: 360, // dakika
        totalTime: 0,
        completedTasks: 0
    },
    activities: []
};

let currentEditingTask = null;

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    renderAllTasks();
    updateProgress();
    renderNotes();
    setupEventListeners();
});

// Event listener'ları kur
function setupEventListeners() {
    // Task checkbox'ları için event delegation
    document.addEventListener('change', (e) => {
        if (e.target.matches('.task-checkbox')) {
            handleTaskCompletion(e.target);
        }
    });

    // Task düzenleme için event delegation
    document.addEventListener('click', (e) => {
        if (e.target.matches('.task-edit-btn')) {
            const taskId = e.target.closest('.task-item').dataset.taskId;
            editTask(taskId);
        }
    });

    // Task form submit
    document.getElementById('taskForm').addEventListener('submit', (e) => {
        e.preventDefault();
        saveTaskFromModal();
    });
}

// Sekme değiştirme
function switchTab(tabId) {
    // Tüm sekmeleri gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Tüm butonların aktif classını kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçili sekmeyi göster
    document.getElementById(tabId).classList.add('active');
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');

    // Sekmeye özel güncellemeler
    if (tabId === 'progress') {
        updateProgress();
    }
}

// Task işlemleri
// Görev işlemleri - app.js
let tasks = [];

function addTask() {
    const title = document.getElementById('taskTitle').value;
    const duration = document.getElementById('taskDuration').value;
    const time = document.getElementById('taskTime').value;

    if(title && duration && time) {
        tasks.push({
            id: Date.now(),
            title,
            duration,
            time,
            completed: false
        });
        saveTasks();
        closeModal('taskModal');
        renderTasks();
    }
}

function deleteTask(taskId) {
    tasks = tasks.filter(task => task.id !== taskId);
    saveTasks();
    renderTasks();
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks();
    }
}

function saveTasks() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
}

function loadTasks() {
    const saved = localStorage.getItem('tasks');
    if(saved) {
        tasks = JSON.parse(saved);
    }
}

// İlerleme takibi
function updateProgress() {
    const totalTasks = planData.tasks.length;
    const completedTasks = planData.tasks.filter(t => t.completed).length;
    const totalTime = planData.tasks.reduce((acc, t) => acc + t.duration, 0);
    const completedTime = planData.tasks
        .filter(t => t.completed)
        .reduce((acc, t) => acc + t.duration, 0);

    // Progress bar'ları güncelle
    const timeProgress = (completedTime / planData.progress.weeklyGoal) * 100;
    const taskProgress = (completedTasks / totalTasks) * 100;

    document.querySelector('#progress .progress-bar .progress').style.width = `${timeProgress}%`;
    document.querySelectorAll('#progress .stats span')[0].textContent = 
        `${completedTime}/${planData.progress.weeklyGoal} dakika`;
    document.querySelectorAll('#progress .stats span')[1].textContent = 
        `${Math.round(timeProgress)}%`;

    // Aktivite geçmişini güncelle
    renderActivityLog();
}

// Not işlemleri
function addNote() {
    const input = document.getElementById('noteInput');
    const text = input.value.trim();
    
    if (!text) return;

    const note = {
        id: Date.now().toString(),
        text,
        date: new Date().toISOString()
    };

    planData.notes.push(note);
    saveData();
    renderNotes();
    input.value = '';
    showNotification('Not eklendi');
}

function renderNotes() {
    const notesList = document.querySelector('.notes-list');
    notesList.innerHTML = planData.notes
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(note => `
            <div class="note-item">
                <p>${note.text}</p>
                <div class="note-footer">
                    <span>${new Date(note.date).toLocaleDateString()}</span>
                    <button onclick="deleteNote('${note.id}')" class="delete-btn">Sil</button>
                </div>
            </div>
        `)
        .join('');
}

function deleteNote(noteId) {
    planData.notes = planData.notes.filter(n => n.id !== noteId);
    saveData();
    renderNotes();
    showNotification('Not silindi');
}

// Veri yönetimi
function saveData() {
    localStorage.setItem('studyPlan', JSON.stringify(planData));
}

function loadData() {
    const saved = localStorage.getItem('studyPlan');
    if (saved) {
        planData = JSON.parse(saved);
    }
}

// Yardımcı fonksiyonlar
function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function closeTaskModal() {
    document.getElementById('taskModal').style.display = 'none';
    currentEditingTask = null;
}

// Calendar entegrasyonu
function syncToCalendar() {
    // Google Calendar entegrasyonu burada olacak
}

// Aktivite geçmişi
function renderActivityLog() {
    const logList = document.querySelector('.log-list');
    logList.innerHTML = planData.activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(activity => `
            <div class="activity-item">
                <span class="activity-icon">${activity.type === 'complete' ? '✅' : '🔄'}</span>
                <span class="activity-text">${activity.text}</span>
                <span class="activity-date">${new Date(activity.date).toLocaleDateString()}</span>
            </div>
        `)
        .join('');
}