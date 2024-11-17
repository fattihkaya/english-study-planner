// app.js - Haftalık plan ve görev yönetimi fonksiyonları
let tasks = [];
let weeklyGoal = {
    minutes: 360, // Haftalık hedef dakika
    completedMinutes: 0,
    completedTasks: 0
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', function() {
    loadData();
    renderTasks();
    updateProgress();
});

// Görev İşlemleri
function addTask(day = 'pazartesi') {
    const title = document.getElementById('taskTitle').value;
    const duration = parseInt(document.getElementById('taskDuration').value);
    const time = document.getElementById('taskTime').value;

    if(title && duration && time) {
        const newTask = {
            id: Date.now(),
            title,
            duration,
            time,
            day,
            completed: false,
            createdAt: new Date().toISOString()
        };

        tasks.push(newTask);
        saveData();
        closeModal('taskModal');
        renderTasks();
        updateProgress();
    }
}

function deleteTask(taskId) {
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if(taskIndex !== -1) {
        if(tasks[taskIndex].completed) {
            weeklyGoal.completedMinutes -= tasks[taskIndex].duration;
            weeklyGoal.completedTasks--;
        }
        tasks.splice(taskIndex, 1);
        saveData();
        renderTasks();
        updateProgress();
    }
}

function toggleTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        task.completed = !task.completed;
        if(task.completed) {
            weeklyGoal.completedMinutes += task.duration;
            weeklyGoal.completedTasks++;
        } else {
            weeklyGoal.completedMinutes -= task.duration;
            weeklyGoal.completedTasks--;
        }
        saveData();
        renderTasks();
        updateProgress();
    }
}

function editTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        // Modal'ı aç ve form alanlarını doldur
        openModal('taskModal');
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDuration').value = task.duration;
        document.getElementById('taskTime').value = task.time;
        
        // Form gönderimini güncelleme işlemi için ayarla
        const form = document.getElementById('taskForm');
        form.onsubmit = (e) => {
            e.preventDefault();
            updateTask(taskId);
        };
    }
}

function updateTask(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if(task) {
        const wasCompleted = task.completed;
        const oldDuration = task.duration;

        task.title = document.getElementById('taskTitle').value;
        task.duration = parseInt(document.getElementById('taskDuration').value);
        task.time = document.getElementById('taskTime').value;

        if(wasCompleted) {
            weeklyGoal.completedMinutes -= oldDuration;
            weeklyGoal.completedMinutes += task.duration;
        }

        saveData();
        closeModal('taskModal');
        renderTasks();
        updateProgress();
    }
}

// Render İşlemleri
function renderTasks() {
    const days = ['pazartesi', 'sali', 'carsamba', 'persembe', 'cuma', 'cumartesi', 'pazar'];
    const times = ['sabah', 'ogle', 'aksam'];

    days.forEach(day => {
        times.forEach(time => {
            const container = document.getElementById(`${day}-${time}`);
            if(container) {
                const dayTasks = tasks.filter(task => task.day === day && task.time === time);
                container.innerHTML = dayTasks.map(task => `
                    <div class="task-item ${task.completed ? 'completed' : ''}">
                        <label class="task-checkbox">
                            <input type="checkbox" 
                                   ${task.completed ? 'checked' : ''} 
                                   onchange="toggleTask(${task.id})">
                            <span class="checkmark"></span>
                        </label>
                        <div class="task-content" onclick="editTask(${task.id})">
                            <div class="task-title">${task.title}</div>
                            <div class="task-duration">${task.duration}dk</div>
                        </div>
                        <button class="delete-btn" onclick="deleteTask(${task.id})">
                            <span>×</span>
                        </button>
                    </div>
                `).join('') || '<div class="no-tasks">Görev yok</div>';
            }
        });
    });
}

function updateProgress() {
    // Haftalık ilerleme
    const progressBar = document.querySelector('.progress-bar .progress');
    const progressText = document.querySelector('.progress-text');
    
    if(progressBar && progressText) {
        const percentage = (weeklyGoal.completedMinutes / weeklyGoal.minutes) * 100;
        progressBar.style.width = `${percentage}%`;
        progressText.textContent = `${weeklyGoal.completedMinutes}/${weeklyGoal.minutes} dakika (${Math.round(percentage)}%)`;
    }

    // Görev tamamlama
    const taskProgress = document.querySelector('.task-progress');
    if(taskProgress) {
        taskProgress.textContent = `${weeklyGoal.completedTasks}/${tasks.length} görev tamamlandı`;
    }
}

// Veri Yönetimi
function saveData() {
    localStorage.setItem('tasks', JSON.stringify(tasks));
    localStorage.setItem('weeklyGoal', JSON.stringify(weeklyGoal));
}

function loadData() {
    const savedTasks = localStorage.getItem('tasks');
    const savedGoal = localStorage.getItem('weeklyGoal');
    
    if(savedTasks) {
        tasks = JSON.parse(savedTasks);
    }
    
    if(savedGoal) {
        weeklyGoal = JSON.parse(savedGoal);
    }

    // Haftalık hedefi sıfırla (eğer yeni hafta başladıysa)
    checkAndResetWeek();
}

function checkAndResetWeek() {
    const lastSave = localStorage.getItem('lastWeekCheck');
    const currentWeek = getWeekNumber(new Date());
    
    if(lastSave) {
        const lastWeek = getWeekNumber(new Date(lastSave));
        if(currentWeek !== lastWeek) {
            // Yeni hafta başlamış, hedefleri sıfırla
            weeklyGoal.completedMinutes = 0;
            weeklyGoal.completedTasks = 0;
            tasks.forEach(task => task.completed = false);
            saveData();
        }
    }
    
    localStorage.setItem('lastWeekCheck', new Date().toISOString());
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// Dışa/İçe Aktarma
function exportPlan() {
    const data = {
        tasks,
        weeklyGoal,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingilizce-plan-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

function importPlan() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                tasks = data.tasks || [];
                weeklyGoal = data.weeklyGoal || {minutes: 360, completedMinutes: 0, completedTasks: 0};
                saveData();
                renderTasks();
                updateProgress();
                alert('Plan başarıyla içe aktarıldı!');
            } catch (error) {
                alert('Plan yüklenirken hata oluştu!');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Takvim Entegrasyonu
function syncToCalendar() {
    const incompleteTasks = tasks.filter(task => !task.completed);
    
    incompleteTasks.forEach(task => {
        const startTime = new Date();
        startTime.setHours(task.time === 'sabah' ? 9 : task.time === 'ogle' ? 13 : 19);
        const endTime = new Date(startTime.getTime() + task.duration * 60000);
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeURIComponent(task.title)}` +
            `&dates=${startTime.toISOString().replace(/[-:.]/g, '')}` +
            `/${endTime.toISOString().replace(/[-:.]/g, '')}` +
            `&details=${encodeURIComponent('İngilizce Çalışma Planı')}`;
        
        window.open(calendarUrl, '_blank');
    });
}

// Event Listeners
document.addEventListener('keydown', function(event) {
    if(event.key === "Escape") {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }
});