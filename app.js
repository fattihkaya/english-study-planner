// Global değişkenler
let currentView = 'weekly';
let currentDate = new Date();
let planData = {
    tasks: [],
    settings: {
        lastUpdate: new Date(),
        version: '1.0'
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadSavedData();
    renderCurrentView();
});

// Veri yükleme fonksiyonu
function loadSavedData() {
    const saved = localStorage.getItem('studyPlan');
    if (saved) {
        try {
            planData = JSON.parse(saved);
            console.log('Veriler yüklendi:', planData);
        } catch (e) {
            console.error('Veri yükleme hatası:', e);
        }
    }
}

// Veri kaydetme fonksiyonu
function saveData() {
    try {
        localStorage.setItem('studyPlan', JSON.stringify(planData));
        console.log('Veriler kaydedildi');
        showNotification('Plan kaydedildi');
    } catch (e) {
        console.error('Kaydetme hatası:', e);
        showNotification('Kaydetme hatası oluştu', 'error');
    }
}

// Dosya yükleme işlemleri
function openFileUpload() {
    document.getElementById('fileInput').click();
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const newPlan = JSON.parse(e.target.result);
            planData = newPlan;
            saveData();
            renderCurrentView();
            showNotification('Plan başarıyla yüklendi');
        } catch (error) {
            console.error('Plan yükleme hatası:', error);
            showNotification('Plan yüklenirken hata oluştu', 'error');
        }
    };
    reader.readAsText(file);
}

// Planı dosyaya kaydetme
function savePlanToFile() {
    const dataStr = JSON.stringify(planData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'inglizce-calisma-plani.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Görünüm değiştirme
function switchView(view) {
    currentView = view;
    document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
    document.getElementById(`${view}View`).classList.add('active');
    
    document.querySelectorAll('.controls .btn').forEach(btn => btn.classList.remove('active'));
    event.target.classList.add('active');
    
    renderCurrentView();
}

// Görünüm render fonksiyonları
function renderCurrentView() {
    if (currentView === 'weekly') {
        renderWeeklyView();
    } else {
        renderMonthlyView();
    }
}

function renderWeeklyView() {
    const container = document.querySelector('.days-container');
    container.innerHTML = '';

    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    days.forEach(day => {
        const dayTasks = planData.tasks.filter(task => task.day.toLowerCase() === day.toLowerCase());
        
        const dayElement = document.createElement('div');
        dayElement.className = 'day-card';
        dayElement.innerHTML = `
            <h3>${day}</h3>
            <div class="tasks">
                ${dayTasks.map(task => `
                    <div class="task">
                        <input type="checkbox" 
                               ${task.completed ? 'checked' : ''} 
                               onchange="toggleTask('${task.id}')">
                        <span>${task.title} (${task.duration}dk)</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(dayElement);
    });
}

function renderMonthlyView() {
    const monthHeader = document.getElementById('currentMonth');
    monthHeader.textContent = currentDate.toLocaleDateString('tr-TR', { 
        month: 'long', 
        year: 'numeric' 
    });

    const calendarGrid = document.querySelector('.calendar-grid');
    calendarGrid.innerHTML = '';

    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    
    // Takvim başlıkları
    const days = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];
    days.forEach(day => {
        const dayHeader = document.createElement('div');
        dayHeader.className = 'calendar-header';
        dayHeader.textContent = day;
        calendarGrid.appendChild(dayHeader);
    });

    // Boş günler
    for (let i = 0; i < firstDay.getDay(); i++) {
        const emptyDay = document.createElement('div');
        emptyDay.className = 'calendar-day empty';
        calendarGrid.appendChild(emptyDay);
    }

    // Ayın günleri
    for (let day = 1; day <= lastDay.getDate(); day++) {
        const dayElement = document.createElement('div');
        dayElement.className = 'calendar-day';
        dayElement.textContent = day;
        
        // O güne ait görevleri kontrol et
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
        const dayTasks = planData.tasks.filter(task => {
            const taskDate = new Date(task.date);
            return taskDate.toDateString() === date.toDateString();
        });
        
        if (dayTasks.length > 0) {
            dayElement.classList.add('has-tasks');
            const taskCount = document.createElement('span');
            taskCount.className = 'task-count';
            taskCount.textContent = dayTasks.length;
            dayElement.appendChild(taskCount);
        }
        
        calendarGrid.appendChild(dayElement);
    }
}

// Örnek planı yükle
function loadSamplePlan() {
    planData = samplePlan;
    saveData();
    renderCurrentView();
    showNotification('Örnek plan yüklendi');
}

// Plan verilerini dışa aktar
function exportPlan() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ingilizce-plan.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Task ekleme/düzenleme modalını göster
function showTaskModal(taskId = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    const task = taskId ? planData.tasks.find(t => t.id === taskId) : null;

    modal.innerHTML = `
        <div class="modal-content">
            <h2>${task ? 'Görevi Düzenle' : 'Yeni Görev'}</h2>
            <form id="taskForm">
                <div class="form-group">
                    <label>Başlık:</label>
                    <input type="text" id="taskTitle" value="${task ? task.title : ''}" required>
                </div>
                <div class="form-group">
                    <label>Süre (dakika):</label>
                    <input type="number" id="taskDuration" value="${task ? task.duration : '15'}" required>
                </div>
                <div class="form-group">
                    <label>Gün:</label>
                    <select id="taskDay" required>
                        ${['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar']
                            .map(day => `<option value="${day.toLowerCase()}" ${task && task.day === day.toLowerCase() ? 'selected' : ''}>${day}</option>`)
                            .join('')}
                    </select>
                </div>
                <div class="form-group">
                    <label>Zaman:</label>
                    <select id="taskTime" required>
                        ${['Sabah', 'Öğle', 'Akşam']
                            .map(time => `<option value="${time.toLowerCase()}" ${task && task.time === time.toLowerCase() ? 'selected' : ''}>${time}</option>`)
                            .join('')}
                    </select>
                </div>
                <div class="button-group">
                    <button type="submit" class="btn">${task ? 'Güncelle' : 'Ekle'}</button>
                    ${task ? '<button type="button" class="btn btn-danger" onclick="deleteTask(\'' + task.id + '\')">Sil</button>' : ''}
                    <button type="button" class="btn" onclick="closeModal()">İptal</button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Form gönderme işlemi
    document.getElementById('taskForm').addEventListener('submit', function(e) {
        e.preventDefault();
        
        const newTask = {
            id: task ? task.id : Date.now().toString(),
            title: document.getElementById('taskTitle').value,
            duration: parseInt(document.getElementById('taskDuration').value),
            day: document.getElementById('taskDay').value,
            time: document.getElementById('taskTime').value,
            completed: task ? task.completed : false,
            category: task ? task.category : 'other'
        };

        if (task) {
            // Mevcut görevi güncelle
            const index = planData.tasks.findIndex(t => t.id === task.id);
            planData.tasks[index] = newTask;
        } else {
            // Yeni görev ekle
            planData.tasks.push(newTask);
        }

        saveData();
        renderCurrentView();
        closeModal();
        showNotification(`Görev ${task ? 'güncellendi' : 'eklendi'}`);
    });
}

// Görevi sil
function deleteTask(taskId) {
    if (confirm('Bu görevi silmek istediğinize emin misiniz?')) {
        planData.tasks = planData.tasks.filter(task => task.id !== taskId);
        saveData();
        renderCurrentView();
        closeModal();
        showNotification('Görev silindi');
    }
}

// Modalı kapat
function closeModal() {
    const modal = document.querySelector('.modal');
    if (modal) {
        modal.remove();
    }
}

// Task tamamlama durumunu değiştir
function toggleTask(taskId) {
    const task = planData.tasks.find(t => t.id === taskId);
    if (task) {
        task.completed = !task.completed;
        saveData();
        renderCurrentView();
    }
}

// Google Calendar'a toplu aktarım
function exportToGoogleCalendar() {
    const tasks = planData.tasks;
    if (tasks.length === 0) {
        showNotification('Aktarılacak görev bulunamadı', 'error');
        return;
    }

    // Tüm görevler için takvim bağlantıları oluştur
    tasks.forEach(task => {
        const startTime = new Date();
        startTime.setHours(task.time === 'sabah' ? 9 : task.time === 'öğle' ? 13 : 18);
        const endTime = new Date(startTime.getTime() + task.duration * 60000);

        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE` +
            `&text=${encodeURIComponent(task.title)}` +
            `&dates=${startTime.toISOString().replace(/[-:.]/g, '')}/${endTime.toISOString().replace(/[-:.]/g, '')}` +
            `&details=${encodeURIComponent('İngilizce Çalışma Planı - ' + task.category)}`;

        window.open(calendarUrl, '_blank');
    });
}

// Task işlemleri
function toggleTask(taskId) {
    const taskIndex = planData.tasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
        planData.tasks[taskIndex].completed = !planData.tasks[taskIndex].completed;
        saveData();
    }
}

// Google Calendar entegrasyonu
function exportToGoogleCalendar() {
    const tasks = planData.tasks;
    if (tasks.length === 0) {
        showNotification('Aktarılacak görev bulunamadı', 'error');
        return;
    }

    // İlk görevi Google Calendar'a aktar
    const task = tasks[0];
    const startTime = new Date();
    const endTime = new Date(startTime.getTime() + task.duration * 60000);

    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${startTime.toISOString().replace(/[-:.]/g, '')}/${endTime.toISOString().replace(/[-:.]/g, '')}&details=${encodeURIComponent('İngilizce Çalışma Planı')}`;

    window.open(calendarUrl, '_blank');
}

// Bildirim gösterme
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Ay değiştirme
function changeMonth(delta) {
    currentDate.setMonth(currentDate.getMonth() + delta);
    renderMonthlyView();
}