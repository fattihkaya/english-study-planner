// Veri yapısı
let planData = {
    tasks: [],
    settings: {
        lastUpdate: new Date()
    }
};

// Görünüm değiştirme
function switchView(view) {
    // Tüm view containerları gizle
    document.querySelectorAll('.view-container').forEach(el => {
        el.classList.remove('active');
    });
    
    // Seçilen view'i göster
    document.getElementById(view + 'View').classList.add('active');
    
    // Button stillerini güncelle
    document.querySelectorAll('.toolbar .btn').forEach(btn => {
        btn.classList.remove('active');
    });
    event.target.classList.add('active');
}

// Dosya yükleme işlemleri
function openFileUpload() {
    document.getElementById('fileInput').click();
}

document.getElementById('fileInput').addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                planData = JSON.parse(e.target.result);
                renderViews();
                alert('Plan başarıyla yüklendi!');
            } catch (error) {
                alert('Plan yüklenirken hata oluştu!');
            }
        };
        reader.readAsText(file);
    }
});

// Plan kaydetme
function exportPlan() {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(planData));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "ingilizce-plan.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
}

// Google Calendar'a ekle
function exportToGoogleCalendar() {
    if (planData.tasks.length === 0) {
        alert('Aktarılacak görev bulunamadı!');
        return;
    }

    planData.tasks.forEach(task => {
        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + (task.duration || 60) * 60000);
        
        const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(task.title)}&dates=${startTime.toISOString().replace(/[-:.]/g, '')}/${endTime.toISOString().replace(/[-:.]/g, '')}`;
        
        window.open(calendarUrl, '_blank');
    });
}

// Görünümleri render et
function renderViews() {
    renderWeeklyView();
    renderMonthlyView();
}

function renderWeeklyView() {
    const container = document.querySelector('.days-grid');
    container.innerHTML = '';
    
    const days = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
    
    days.forEach(day => {
        const dayTasks = planData.tasks.filter(task => task.day === day.toLowerCase());
        
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.innerHTML = `
            <h3>${day}</h3>
            <div class="tasks">
                ${dayTasks.map(task => `
                    <div class="task">
                        <input type="checkbox" ${task.completed ? 'checked' : ''}>
                        <span>${task.title} (${task.duration}dk)</span>
                    </div>
                `).join('')}
            </div>
        `;
        
        container.appendChild(dayCard);
    });
}

function renderMonthlyView() {
    // Aylık görünüm render işlemleri buraya gelecek
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // LocalStorage'dan veri yükle
    const saved = localStorage.getItem('studyPlan');
    if (saved) {
        planData = JSON.parse(saved);
    }
    
    renderViews();
});