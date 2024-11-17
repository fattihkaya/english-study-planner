// Veri yapısı
let planData = {
    tasks: [],
    currentMonth: new Date(),
    lastUpdate: null
};

// LocalStorage işlemleri
const STORAGE_KEY = 'study-planner-data';

// Verileri yükle
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
        planData = JSON.parse(saved);
        planData.currentMonth = new Date(planData.currentMonth);
        renderWeeklyView();
        renderMonthlyView();
    }
}

// Verileri kaydet
function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(planData));
}

// Örnek plan
const samplePlan = {
    tasks: [
        {
            id: '1',
            title: 'English with Lucy: Present Perfect',
            duration: 15,
            day: 'pazartesi',
            time: 'sabah',
            completed: false
        },
        // Diğer örnek görevler...
    ]
};

// Plan yükleme işlemleri
function showPlanUploadModal() {
    document.getElementById('planUploadModal').style.display = 'block';
}

function uploadPlan() {
    const fileInput = document.getElementById('planFile');
    const file = fileInput.files[0];
    
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const newPlan = JSON.parse(e.target.result);
                planData.tasks = newPlan.tasks;
                saveData();
                renderWeeklyView();
                renderMonthlyView();
                closeModal('planUploadModal');
                showMessage('Plan başarıyla yüklendi!');
            } catch (error) {
                showMessage('Plan yüklenirken hata oluştu!', 'error');
            }
        };
        reader.readAsText(file);
    } else {
        showMessage('Lütfen bir dosya seçin!', 'error');
    }
}

// Görünüm değiştirme
function switchView(view) {
    const weeklyView = document.getElementById('weeklyView');
    const monthlyView = document.getElementById('monthlyView');
    
    if (view === 'weekly') {
        weeklyView.style.display = 'grid';
        monthlyView.style.display = 'none';
    } else {
        weeklyView.style.display = 'none';
        monthlyView.style.display = 'block';
    }
    
    // Buton stillerini güncelle
    document.querySelectorAll('.view-controls .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Aylık takvim işlemleri
function renderMonthlyView() {
    const calendar = document.querySelector('.calendar-grid');
    calendar.innerHTML = '';
    
    const month = planData.currentMonth.getMonth();
    const year = planData.currentMonth.getFullYear();
    
    document.getElementById('currentMonth').textContent = 
        new Date(year, month).toLocaleString('tr-TR', { month: 'long', year: 'numeric' });
    
    // Ayın ilk gününün haftanın hangi günü olduğunu bul
    const firstDay = new Date(year, month, 1).getDay();
    // Aydaki gün sayısını bul
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    
    // Günleri oluştur
    for (let i = 0; i < 42; i++) {
        const dayDiv = document.createElement('div');
        dayDiv.className = 'calendar-day';
        
        const dayNumber = i - firstDay + 1;
        if (dayNumber > 0 && dayNumber <= daysInMonth) {
            dayDiv.textContent = dayNumber;
            
            // O güne ait görevleri bul
            const dayTasks = planData.tasks.filter(task => {
                const taskDate = new Date(task.date);
                return taskDate.getDate() === dayNumber &&
                       taskDate.getMonth() === month &&
                       taskDate.getFullYear() === year;
            });
            
            if (dayTasks.length > 0) {
                dayDiv.classList.add('has-tasks');
                // Görev sayısını göster
                const taskCount = document.createElement('span');
                taskCount.className = 'task-count';
                taskCount.textContent = dayTasks.length;
                dayDiv.appendChild(taskCount);
            }
        }
        
        calendar.appendChild(dayDiv);
    }
}

function previousMonth() {
    planData.currentMonth.setMonth(planData.currentMonth.getMonth() - 1);
    renderMonthlyView();
}

function nextMonth() {
    planData.currentMonth.setMonth(planData.currentMonth.getMonth() + 1);
    renderMonthlyView();
}

// Task işlemleri
function addNewTask() {
    document.getElementById('taskId').value = '';
    document.getElementById('taskEditForm').reset();
    document.getElementById('taskEditModal').style.display = 'block';
}

function editTask(taskId) {
    const task = planData.tasks.find(t => t.id === taskId);
    if (task) {
        document.getElementById('taskId').value = task.id;
        document.getElementById('taskTitle').value = task.title;
        document.getElementById('taskDuration').value = task.duration;
        document.getElementById('taskDay').value = task.day;
        document.getElementById('taskTime').value = task.time;
        document.getElementById('taskEditModal').style.display = 'block';
    }
}

function deleteTask() {
    const taskId = document.getElementById('taskId').value;
    if (taskId) {
        planData.tasks = planData.tasks.filter(t => t.id !== taskId);
        saveData();
        renderWeeklyView();
        renderMonthlyView();
        closeModal('taskEditModal');
        showMessage('Görev silindi!');
    }
}

// Form gönderme işlemi
document.getElementById('taskEditForm').addEventListener('submit', function(e) {
    e.preventDefault();
    
    const taskId = document.getElementById('taskId').value;
    const newTask = {
        id: taskId || Date.now().toString(),
        title: document.getElementById('taskTitle').value,
        duration: parseInt(document.getElementById('taskDuration').value),
        day: document.getElementById('taskDay').value,
        time: document.getElementById('taskTime').value,
        completed: false,
        date: new Date()
    };
    
    if (taskId) {
        // Mevcut görevi güncelle
        const index = planData.tasks.findIndex(t => t.id === taskId);
        planData.tasks[index] = newTask;
    } else {
        // Yeni görev ekle
        planData.tasks.push(newTask);
    }
    
    saveData();
    renderWeeklyView();
    renderMonthlyView();
    closeModal('taskEditModal');
    showMessage('Görev kaydedildi!');
});

// Yardımcı fonksiyonlar
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

function showMessage(message, type = 'success') {
    // Basit bir bildirim göster
    alert(message);
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadData();
    
    // Drag and drop desteği
    const uploadArea = document.querySelector('.upload-area');
    
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('drag-over');
    });
    
    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('drag-over');
    });
    
    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file) {
            document.getElementById('planFile').files = e.dataTransfer.files;
            uploadPlan();
        }
    });
});

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}