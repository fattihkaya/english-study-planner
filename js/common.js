// Tüm sayfalarda kullanılacak ortak fonksiyonlar
function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if(modal) {
        modal.style.display = 'block';
    }
}

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

// Modal dışı tıklama ile kapatma
window.onclick = function(event) {
    if(event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}

// ESC tuşu ile kapatma
document.addEventListener('keydown', function(event) {
    if(event.key === "Escape") {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }
});