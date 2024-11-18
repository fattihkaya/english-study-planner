// Global state yönetimi
const state = {
    currentView: 'weekly',
    currentDay: 'pazartesi',
    currentModal: null
};

// Sayfa yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    initializeView();
});

// Event listener'ları kur
function setupEventListeners() {
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

    // Search ve filter işlemleri için
    const searchInput = document.getElementById('searchWord');
    if (searchInput) {
        searchInput.addEventListener('input', handleSearch);
    }

    const filters = document.querySelectorAll('.filter-select');
    filters.forEach(filter => {
        filter.addEventListener('change', handleFilter);
    });
}

// Görünüm değiştirme
function switchView(view) {
    // Eski view'ı gizle
    const oldView = document.querySelector('.view-content.active');
    if (oldView) {
        oldView.classList.remove('active');
    }

    // Yeni view'ı göster
    const newView = document.getElementById(`${view}-view`);
    if (newView) {
        newView.classList.add('active');
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

    // View'a özel güncellemeler
    updateViewContent(view);
}

// View içeriğini güncelle
function updateViewContent(view) {
    switch(view) {
        case 'weekly':
            renderTasks();
            break;
        case 'progress':
            updateStatistics();
            renderActivityList();
            break;
        case 'vocabulary':
            renderWordList();
            break;
        case 'modernFamily':
            renderEpisodes();
            break;
    }
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
        modal.style.display = 'block';
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

// Arama ve filtreleme
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    if (state.currentView === 'vocabulary') {
        filterWords(searchTerm);
    }
}

function handleFilter(event) {
    const filterType = event.target.dataset.filter;
    const filterValue = event.target.value;
    
    if (state.currentView === 'vocabulary') {
        filterWords(null, filterType, filterValue);
    }
}

// Bildirimler
function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Yardımcı fonksiyonlar
function initializeView() {
    // URL'den view parametresini al
    const urlParams = new URLSearchParams(window.location.search);
    const view = urlParams.get('view') || 'weekly';
    
    // İlgili view'ı göster
    switchView(view);
}

function formatDate(date) {
    return new Date(date).toLocaleDateString('tr-TR', {
        day: '2-digit',
        month: 'long',
        year: 'numeric'
    });
}

function formatTime(date) {
    return new Date(date).toLocaleTimeString('tr-TR', {
        hour: '2-digit',
        minute: '2-digit'
    });
}