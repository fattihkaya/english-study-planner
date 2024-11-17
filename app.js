// LocalStorage işlemleri
const STORAGE_KEY = 'study-planner-data';

// Verileri localStorage'dan yükleme
function loadData() {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : {
        tasks: {},
        lastUpdate: new Date().toISOString()
    };
}

// Verileri localStorage'a kaydetme
function saveData(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

// İlerleme durumunu hesaplama ve kaydetme
function saveProgress() {
    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const progress = (checked / total) * 100;

    const data = loadData();
    data.tasks = {};
    
    checkboxes.forEach((cb, index) => {
        data.tasks[`task${index}`] = {
            checked: cb.checked,
            date: new Date().toISOString()
        };
    });
    
    data.lastUpdate = new Date().toISOString();
    saveData(data);
    
    // İlerleme çubuğunu güncelle
    const progressBar = document.getElementById('progressBarFill');
    const progressText = document.getElementById('progressText');
    if (progressBar && progressText) {
        progressBar.style.width = `${progress}%`;
        progressText.textContent = `%${Math.round(progress)} Tamamlandı`;
    }
}

// Kaydedilmiş ilerlemeyi yükleme
function loadSavedProgress() {
    const data = loadData();
    
    Object.entries(data.tasks).forEach(([taskId, taskData]) => {
        const checkbox = document.querySelector(`#${taskId}`);
        if (checkbox) {
            checkbox.checked = taskData.checked;
        }
    });
    
    saveProgress(); // İlerleme çubuğunu güncelle
}

// Google Calendar'a ekle
function exportToGoogleCalendar() {
    const tasks = document.querySelectorAll('.task label');
    const events = Array.from(tasks).map(task => ({
        text: task.textContent,
        date: new Date()
    }));
    
    // Google Calendar URL'i oluştur
    const firstEvent = events[0];
    const googleUrl = `https://www.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(firstEvent.text)}`;
    window.open(googleUrl, '_blank');
}

// Outlook Calendar'a ekle
function exportToOutlookCalendar() {
    const tasks = document.querySelectorAll('.task label');
    const events = Array.from(tasks).map(task => ({
        text: task.textContent,
        date: new Date()
    }));
    
    // Outlook Calendar URL'i oluştur
    const firstEvent = events[0];
    const outlookUrl = `https://outlook.office.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(firstEvent.text)}`;
    window.open(outlookUrl, '_blank');
}

// İlerleme modalını göster
function showProgress() {
    const modal = document.getElementById('progressModal');
    modal.style.display = 'block';
}

// İlerleme modalını kapat
function closeProgressModal() {
    const modal = document.getElementById('progressModal');
    modal.style.display = 'none';
}

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadSavedProgress();
    
    // Plan yükleme işlemi
    const planUpload = document.getElementById('planUpload');
    planUpload.addEventListener('change', (event) => {
        const file = event.target.files[0];
        const reader = new FileReader();
        
        reader.onload = function(e) {
            try {
                const plan = JSON.parse(e.target.result);
                // Plan verilerini işle ve uygula
                console.log('Plan yüklendi:', plan);
            } catch (error) {
                console.error('Plan yükleme hatası:', error);
            }
        };
        
        reader.readAsText(file);
    });
});

// Modal dışına tıklandığında kapat
window.onclick = function(event) {
    const modal = document.getElementById('progressModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
}
