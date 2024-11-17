// Veri yapısı
let planData = {
    tasks: {},
    progress: {
        weekly: {},
        monthly: {}
    },
    notes: [],
    settings: {
        lastUpdate: null
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    setupTabNavigation();
});

// Temel event listener'ları kur
function setupEventListeners() {
    // Checkbox değişikliklerini dinle
    document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
        checkbox.addEventListener('change', (e) => {
            updateTaskStatus(e.target);
            updateProgress();
            saveData();
        });
    });
}

// Sekme navigasyonu
function setupTabNavigation() {
    document.querySelectorAll('.tab').forEach(tab => {
        tab.addEventListener('click', () => {
            // Aktif sekmeyi değiştir
            document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            // İlgili içeriği göster
            const targetId = tab.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(targetId).classList.add('active');
        });
    });
}

// Task durumunu güncelle
function updateTaskStatus(checkbox) {
    const taskId = checkbox.name;
    const isCompleted = checkbox.checked;
    
    planData.tasks[taskId] = {
        completed: isCompleted,
        completedAt: isCompleted ? new Date().toISOString() : null
    };
    
    // Görsel geri bildirim
    const taskElement = checkbox.closest('.task');
    if (isCompleted) {
        taskElement.classList.add('completed');
    } else {
        taskElement.classList.remove('completed');
    }
    
    showNotification(isCompleted ? 'Görev tamamlandı! 🎉' : 'Görev yeniden açıldı');
}

// İlerlemeyi güncelle
function updateProgress() {
    document.querySelectorAll('.day-card').forEach(dayCard => {
        const total = dayCard.querySelectorAll('.task').length;
        const completed = dayCard.querySelectorAll('input[type="checkbox"]:checked').length;
        
        dayCard.querySelector('.completion').textContent = `${completed}/${total}`;
    });
}

// LocalStorage işlemleri
function saveData() {
    planData.settings.lastUpdate = new Date().toISOString();
    localStorage.setItem('studyPlan', JSON.stringify(planData));
    showNotification('Veriler kaydedildi');
}

function loadData() {
    const saved = localStorage.getItem('studyPlan');
    if (saved) {
        planData = JSON.parse(saved);
        restoreTaskStates();
        updateProgress();
    }
}

// Kaydedilmiş görev durumlarını geri yükle
function restoreTaskStates() {
    Object.entries(planData.tasks).forEach(([taskId, data]) => {
        const checkbox = document.querySelector(`input[name="${taskId}"]`);
        if (checkbox) {
            checkbox.checked = data.completed;
            if (data.completed) {
                checkbox.closest('.task').classList.add('completed');
            }
        }
    });
}

// Veri dışa/içe aktarma
function exportData() {
    const dataStr = "data:text/json;charset=utf-8," + 
                   encodeURIComponent(JSON.stringify(planData, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ingilizce-plan.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

function importData() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = e => {
        const file = e.target.files[0];
        const reader = new FileReader();
        
        reader.onload = event => {try {
                const importedData = JSON.parse(event.target.result);
                planData = importedData;
                saveData();
                restoreTaskStates();
                updateProgress();
                showNotification('Plan başarıyla içe aktarıldı');
            } catch (error) {
                showNotification('Plan yüklenirken hata oluştu!', 'error');
            }
        };
        
        reader.readAsText(file);
    };
    
    input.click();
}

// Google Calendar Senkronizasyonu
function syncWithCalendar() {
    const tasks = document.querySelectorAll('.task');
    if (tasks.length === 0) {
        showNotification('Aktarılacak görev bulunamadı', 'error');
        return;
    }

    tasks.forEach(task => {
        const title = task.querySelector('.task-title').textContent;
        const duration = parseInt(task.querySelector('.task-duration').textContent);
        
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + duration * 60000);

        const calendarUrl = 
            `https://calendar.google.com/calendar/render?` +
            `action=TEMPLATE&` +
            `text=${encodeURIComponent('🇬🇧 ' + title)}&` +
            `dates=${startTime.toISOString().replace(/[-:.]/g, '')}/${endTime.toISOString().replace(/[-:.]/g, '')}&` +
            `details=${encodeURIComponent('İngilizce Çalışma Planı')}`;

        window.open(calendarUrl, '_blank');
    });
}

// Bildirim gösterme
function showNotification(message, type = 'success') {
    const notification = document.getElementById('notification');
    const messageElement = notification.querySelector('.notification-message');
    
    notification.className = `notification ${type}`;
    messageElement.textContent = message;
    
    notification.style.display = 'block';
    
    setTimeout(() => {
        notification.style.display = 'none';
    }, 3000);
}

// İlerleme takibi için haftalık istatistikler
function calculateWeeklyStats() {
    const stats = {
        totalTasks: 0,
        completedTasks: 0,
        totalTime: 0,
        completedTime: 0
    };

    document.querySelectorAll('.task').forEach(task => {
        const duration = parseInt(task.querySelector('.task-duration').textContent);
        const isCompleted = task.querySelector('input[type="checkbox"]').checked;
        
        stats.totalTasks++;
        stats.totalTime += duration;
        
        if (isCompleted) {
            stats.completedTasks++;
            stats.completedTime += duration;
        }
    });

    return stats;
}

// Progress sekmesi için grafik verilerini hazırla
function updateProgressTab() {
    const stats = calculateWeeklyStats();
    const progressSection = document.getElementById('progress');
    
    progressSection.innerHTML = `
        <div class="progress-stats">
            <div class="stat-card">
                <h3>Tamamlanan Görevler</h3>
                <div class="stat-value">${stats.completedTasks}/${stats.totalTasks}</div>
                <div class="progress-bar">
                    <div class="progress" style="width: ${(stats.completedTasks/stats.totalTasks*100)}%"></div>
                </div>
            </div>
            
            <div class="stat-card">
                <h3>Toplam Çalışma Süresi</h3>
                <div class="stat-value">${stats.completedTime} dk</div>
                <div class="sub-text">Hedef: ${stats.totalTime} dk</div>
            </div>
        </div>
    `;
}

// Not ekleme fonksiyonu
function addNote() {
    const notesContainer = document.querySelector('.notes-container');
    const noteText = document.getElementById('noteInput').value;
    
    if (!noteText.trim()) return;
    
    const note = {
        id: Date.now(),
        text: noteText,
        createdAt: new Date().toISOString()
    };
    
    planData.notes.push(note);
    saveData();
    
    renderNote(note);
    document.getElementById('noteInput').value = '';
}

// Not render fonksiyonu
function renderNote(note) {
    const noteElement = document.createElement('div');
    noteElement.className = 'note-card';
    noteElement.innerHTML = `
        <p>${note.text}</p>
        <div class="note-footer">
            <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
            <button onclick="deleteNote(${note.id})" class="btn-delete">Sil</button>
        </div>
    `;
    
    document.querySelector('.notes-container').prepend(noteElement);
}

// Not silme fonksiyonu
function deleteNote(noteId) {
    planData.notes = planData.notes.filter(note => note.id !== noteId);
    saveData();
    document.querySelector('.notes-container').innerHTML = '';
    planData.notes.forEach(renderNote);
}

// Notları yükle
function loadNotes() {
    if (planData.notes) {
        document.querySelector('.notes-container').innerHTML = '';
        planData.notes.forEach(renderNote);
    }
}

// Sayfa yüklendiğinde çalışacak ek fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    setupEventListeners();
    setupTabNavigation();
    loadNotes();
    updateProgressTab();
});