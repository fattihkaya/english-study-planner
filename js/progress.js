// İlerleme takibi için veri yapısı
let progressData = {
    weeklyGoal: {
        minutes: 360,
        completedMinutes: 0
    },
    statistics: {
        totalWords: 0,
        monthlyWords: 0,
        watchedEpisodes: 0,
        currentStreak: 0,
        longestStreak: 0,
        lastStudyDate: null
    },
    activities: []
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadProgressData();
    updateStatistics();
    renderActivityList();
    checkAndUpdateStreak();
});

// İstatistik hesaplamaları ve güncelleme
function updateStatistics() {
    // Haftalık hedef ilerleme
    const weeklyProgress = (progressData.weeklyGoal.completedMinutes / progressData.weeklyGoal.minutes) * 100;
    const weeklyProgressBar = document.getElementById('weeklyProgress');
    const weeklyProgressText = document.getElementById('weeklyProgressText');
    
    if (weeklyProgressBar) {
        weeklyProgressBar.style.width = `${weeklyProgress}%`;
    }
    if (weeklyProgressText) {
        weeklyProgressText.textContent = 
            `${progressData.weeklyGoal.completedMinutes}/${progressData.weeklyGoal.minutes} dakika (${Math.round(weeklyProgress)}%)`;
    }

    // Kelime sayısı
    const wordCount = document.getElementById('wordCount');
    if (wordCount) {
        wordCount.textContent = progressData.statistics.monthlyWords;
    }

    // İzlenen bölümler
    const episodeCount = document.getElementById('episodeCount');
    if (episodeCount) {
        episodeCount.textContent = progressData.statistics.watchedEpisodes;
    }

    // Streak
    const streakCount = document.getElementById('streakCount');
    if (streakCount) {
        streakCount.textContent = `${progressData.statistics.currentStreak} gün`;
    }
}

// Aktivite geçmişi
function renderActivityList() {
    const activityList = document.getElementById('activityList');
    if (!activityList) return;

    const activities = progressData.activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 50); // Son 50 aktivite

    activityList.innerHTML = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-time">${formatDate(activity.date)}</div>
            <div class="activity-badge ${activity.category}">${getCategoryLabel(activity.category)}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-detail">${activity.detail}</div>
            </div>
        </div>
    `).join('') || '<div class="no-activity">Henüz aktivite yok</div>';
}

// Yeni aktivite ekleme
function addActivity(activity) {
    progressData.activities.unshift({
        id: Date.now(),
        date: new Date().toISOString(),
        ...activity
    });

    // İstatistikleri güncelle
    updateActivityStatistics(activity);
    
    saveProgressData();
    renderActivityList();
}

// Aktivite bazlı istatistik güncelleme
function updateActivityStatistics(activity) {
    switch(activity.category) {
        case 'vocabulary':
            progressData.statistics.totalWords++;
            progressData.statistics.monthlyWords++;
            break;
            
        case 'video':
            if (activity.type === 'modernFamily') {
                progressData.statistics.watchedEpisodes++;
            }
            progressData.weeklyGoal.completedMinutes += activity.duration || 0;
            break;
            
        case 'grammar':
        case 'listening':
            progressData.weeklyGoal.completedMinutes += activity.duration || 0;
            break;
    }

    checkAndUpdateStreak();
}

// Streak kontrolü ve güncelleme
function checkAndUpdateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const lastStudy = progressData.statistics.lastStudyDate;

    if (!lastStudy) {
        // İlk çalışma
        progressData.statistics.currentStreak = 1;
    } else {
        const lastStudyDate = new Date(lastStudy);
        const diffDays = getDaysDifference(lastStudyDate, new Date());

        if (diffDays === 0) {
            // Aynı gün, streak'i koru
            return;
        } else if (diffDays === 1) {
            // Ardışık gün, streak'i artır
            progressData.statistics.currentStreak++;
        } else {
            // Streak kırıldı
            progressData.statistics.currentStreak = 1;
        }
    }

    // En uzun streak'i güncelle
    if (progressData.statistics.currentStreak > progressData.statistics.longestStreak) {
        progressData.statistics.longestStreak = progressData.statistics.currentStreak;
    }

    progressData.statistics.lastStudyDate = today;
    saveProgressData();
}

// Haftalık sıfırlama kontrolü
function checkWeeklyReset() {
    const lastReset = localStorage.getItem('lastWeeklyReset');
    const today = new Date();
    const currentWeek = getWeekNumber(today);

    if (lastReset) {
        const lastResetWeek = getWeekNumber(new Date(lastReset));
        if (currentWeek !== lastResetWeek) {
            // Yeni hafta başlangıcı
            progressData.weeklyGoal.completedMinutes = 0;
            progressData.statistics.monthlyWords = 0; // Aylık kelime sayısını da sıfırla
            saveProgressData();
        }
    }

    localStorage.setItem('lastWeeklyReset', today.toISOString());
}

// Veri yönetimi
function saveProgressData() {
    localStorage.setItem('progressData', JSON.stringify(progressData));
}

function loadProgressData() {
    const saved = localStorage.getItem('progressData');
    if (saved) {
        progressData = JSON.parse(saved);
        checkWeeklyReset();
    }
}

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}

function getCategoryLabel(category) {
    const labels = {
        vocabulary: 'Kelime',
        video: 'Video',
        grammar: 'Gramer',
        listening: 'Dinleme'
    };
    return labels[category] || category;
}

function getDaysDifference(date1, date2) {
    const oneDay = 24 * 60 * 60 * 1000;
    const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
    const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
    return Math.round(Math.abs((d1 - d2) / oneDay));
}

function getWeekNumber(date) {
    const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
    const pastDaysOfYear = (date - firstDayOfYear) / 86400000;
    return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

// İstatistik grafikleri
function renderCharts() {
    const weeklyData = getWeeklyActivityData();
    const categoryData = getCategoryDistribution();

    // Haftalık aktivite grafiği
    const weeklyChart = new Chart(document.getElementById('weeklyChart'), {
        type: 'bar',
        data: {
            labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            datasets: [{
                label: 'Çalışma Süresi (dk)',
                data: weeklyData,
                backgroundColor: '#007AFF'
            }]
        },
        options: {
            responsive: true,
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    // Kategori dağılım grafiği
    const categoryChart = new Chart(document.getElementById('categoryChart'), {
        type: 'doughnut',
        data: {
            labels: ['Kelime', 'Video', 'Gramer', 'Dinleme'],
            datasets: [{
                data: categoryData,
                backgroundColor: ['#34C759', '#007AFF', '#FF9500', '#5856D6']
            }]
        }
    });
}

function getWeeklyActivityData() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    const today = new Date();
    const weekStart = new Date(today.setDate(today.getDate() - today.getDay() + 1));
    
    return days.map(day => {
        return progressData.activities
            .filter(activity => {
                const activityDate = new Date(activity.date);
                return activityDate >= weekStart && 
                       activityDate.toLocaleString('en', {weekday: 'long'}) === day;
            })
            .reduce((sum, activity) => sum + (activity.duration || 0), 0);
    });
}

function getCategoryDistribution() {
    const categories = ['vocabulary', 'video', 'grammar', 'listening'];
    return categories.map(category => {
        return progressData.activities
            .filter(activity => activity.category === category)
            .length;
    });
}

// Veri dışa aktarma
function exportProgress() {
    const data = {
        progressData,
        exportDate: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ingilizce-ilerleme-${new Date().toLocaleDateString()}.json`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}