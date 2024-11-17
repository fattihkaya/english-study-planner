// Modal işlemleri
function openAddTaskModal(day) {
    const modal = document.getElementById('taskModal');
    if(modal) {
        // Form alanlarını temizle
        document.getElementById('taskForm').reset();
        // Gün bilgisini sakla
        document.getElementById('taskDay').value = day || 'pazartesi';
        // Modal'ı göster
        modal.style.display = 'block';
    }
}

// Tab değiştirme
function switchView(view) {
    // Tüm tabları gizle
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.style.display = 'none';
    });
    
    // Tüm butonların aktif classını kaldır
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // Seçilen tabı göster
    const selectedTab = document.getElementById(`${view}-view`);
    if(selectedTab) {
        selectedTab.style.display = 'block';
    }
    
    // Seçilen butonu aktif yap
    const selectedBtn = document.querySelector(`[onclick="switchView('${view}')"]`);
    if(selectedBtn) {
        selectedBtn.classList.add('active');
    }
}

// Modal kapatma
function closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'none';
        // Form varsa temizle
        const form = modal.querySelector('form');
        if(form) {
            form.reset();
        }
    }
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

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    // ESC tuşu ile modal kapatma
    document.addEventListener('keydown', (e) => {
        if(e.key === 'Escape') {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => modal.style.display = 'none');
        }
    });

    // Modal dışına tıklama ile kapatma
    window.onclick = (event) => {
        if(event.target.classList.contains('modal')) {
            event.target.style.display = 'none';
        }
    };
});