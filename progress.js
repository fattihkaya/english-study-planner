// İlerleme verisi
let progressData = {
    weeklyStats: {
        targetMinutes: 360,
        completedMinutes: 0,
        completedTasks: 0,
        totalTasks: 15
    },
    vocabulary: {
        monthlyWords: 0,
        totalWords: 0,
        streak: 0
    },
    watchHistory: {
        completedEpisodes: 0,
        totalMinutes: 0
    },
    activities: []
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadProgressData();
    renderStats();
    renderCharts();
    renderActivityHistory();
});

// Verileri yükle
function loadProgressData() {
    const saved = localStorage.getItem('progressData');
    if (saved) {
        progressData = JSON.parse(saved);
    }
}

// İstatistikleri göster
function renderStats() {
    // Haftalık hedef progress
    const weeklyProgress = (progressData.weeklyStats.completedMinutes / progressData.weeklyStats.targetMinutes) * 100;
    document.querySelector('.highlight .progress').style.width = `${weeklyProgress}%`;
    document.querySelector('.highlight .stat-detail').textContent = 
        `${progressData.weeklyStats.completedMinutes}/${progressData.weeklyStats.targetMinutes} dakika`;

    // Diğer istatistikler
    updateStatCard('vocabulary', progressData.vocabulary.monthlyWords);
    updateStatCard('episodes', progressData.watchHistory.completedEpisodes);
    updateStatCard('streak', `${progressData.vocabulary.streak} gün`);
}

// Grafikleri çiz
function renderCharts() {
    // Günlük çalışma süresi grafiği
    const ctx = document.querySelector('.chart').getContext('2d');
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'],
            datasets: [{
                label: 'Çalışma Süresi (dk)',
                data: calculateDailyMinutes(),
                backgroundColor: 'rgba(0, 102, 255, 0.6)'
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

    // Aktivite dağılımı pasta grafiği
    const pieCtx = document.querySelector('.chart:last-child').getContext('2d');
    new Chart(pieCtx, {
        type: 'doughnut',
        data: {
            labels: ['Gramer', 'Kelime', 'İzleme', 'Dinleme'],
            datasets: [{
                data: calculateActivityDistribution(),
                backgroundColor: [
                    '#1565C0',
                    '#2E7D32',
                    '#7B1FA2',
                    '#E65100'
                ]
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom'
                }
            }
        }
    });
}

// Aktivite geçmişini göster
function renderActivityHistory() {
    const activityList = document.querySelector('.activity-list');
    activityList.innerHTML = progressData.activities
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .map(activity => `
            <div class="activity-item">
                <div class="activity-time">${formatTime(activity.date)}</div>
                <div class="activity-badge ${activity.type}">${activity.category}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-detail">${activity.duration}dk • ${activity.detail}</div>
                </div>
            </div>
        `)
        .join('');
}

// Yardımcı fonksiyonlar
function updateStatCard(type, value) {
    const card = document.querySelector(`[data-stat="${type}"]`);
    if (card) {
        card.querySelector('.stat-value').textContent = value;
    }
}

function calculateDailyMinutes() {
    const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    return days.map(day => {
        return progressData.activities
            .filter(a => new Date(a.date).toLocaleString('en', {weekday: 'long'}) === day)
            .reduce((sum, a) => sum + a.duration, 0);
    });
}

function calculateActivityDistribution() {
    const categories = ['grammar', 'vocabulary', 'watching', 'listening'];
    return categories.map(cat => {
        return progressData.activities
            .filter(a => a.category === cat)
            .reduce((sum, a) => sum + a.duration, 0);
    });
}

function formatTime(dateString) {
    return new Date(dateString).toLocaleTimeString('tr', {
        hour: '2-digit',
        minute: '2-digit'
    });
}
