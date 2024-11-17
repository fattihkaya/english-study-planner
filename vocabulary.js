// Kelime verisi
let vocabularyData = {
    words: [],
    settings: {
        sortBy: 'date',
        filterSource: 'all',
        searchTerm: ''
    }
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadVocabularyData();
    setupSearchAndFilters();
    renderWordList();
});

// Verileri yükle
function loadVocabularyData() {
    const saved = localStorage.getItem('vocabularyData');
    if (saved) {
        vocabularyData = JSON.parse(saved);
    }
}

// Arama ve filtreleme
function setupSearchAndFilters() {
    // Arama input'u
    const searchInput = document.querySelector('.search-box input');
    searchInput.addEventListener('input', (e) => {
        vocabularyData.settings.searchTerm = e.target.value;
        renderWordList();
    });

    // Filtreler
    document.querySelectorAll('.filter-group select').forEach(select => {
        select.addEventListener('change', (e) => {
            if (e.target.dataset.filter === 'source') {
                vocabularyData.settings.filterSource = e.target.value;
            } else if (e.target.dataset.filter === 'sort') {
                vocabularyData.settings.sortBy = e.target.value;
            }
            renderWordList();
        });
    });
}

// Kelime listesini render et
function renderWordList() {
    const container = document.querySelector('.vocabulary-list');
    const filteredWords = filterWords();
    
    container.innerHTML = filteredWords.map(word => `
        <div class="word-card">
            <div class="word-header">
                <h3>${word.term}</h3>
                <div class="word-badges">
                    <span class="badge source">${word.source}</span>
                    <span class="badge status">${getWordStatus(word)}</span>
                </div>
            </div>
            <p class="word-definition">${word.definition}</p>
            ${word.example ? `<p class="word-example">"${word.example}"</p>` : ''}
            <div class="word-actions">
                <button onclick="editWord('${word.id}')" class="btn small">Düzenle</button>
                <button onclick="reviewWord('${word.id}')" class="btn small">Tekrar Et</button>
<button onclick="exportWord('${word.id}')" class="btn small">Dışa Aktar</button>
            </div>
        </div>
    `).join('');
}

// Kelime filtreleme
function filterWords() {
    let filtered = [...vocabularyData.words];
    
    // Kaynak filtresi
    if (vocabularyData.settings.filterSource !== 'all') {
        filtered = filtered.filter(word => 
            word.source === vocabularyData.settings.filterSource
        );
    }
    
    // Arama filtresi
    if (vocabularyData.settings.searchTerm) {
        const searchTerm = vocabularyData.settings.searchTerm.toLowerCase();
        filtered = filtered.filter(word =>
            word.term.toLowerCase().includes(searchTerm) ||
            word.definition.toLowerCase().includes(searchTerm)
        );
    }
    
    // Sıralama
    filtered.sort((a, b) => {
        switch (vocabularyData.settings.sortBy) {
            case 'az':
                return a.term.localeCompare(b.term);
            case 'status':
                return (b.lastReview || 0) - (a.lastReview || 0);
            default: // date
                return new Date(b.addedDate) - new Date(a.addedDate);
        }
    });
    
    return filtered;
}

// Yeni kelime ekleme
function addNewWord() {
    showWordModal();
}

// Kelime düzenleme
function editWord(wordId) {
    const word = vocabularyData.words.find(w => w.id === wordId);
    if (word) {
        showWordModal(word);
    }
}

// Kelime modalı
function showWordModal(word = null) {
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content">
            <h2>${word ? 'Kelime Düzenle' : 'Yeni Kelime'}</h2>
            <form id="wordForm" onsubmit="saveWord(event, '${word?.id || ''}')">
                <div class="form-group">
                    <label>Kelime</label>
                    <input type="text" id="wordTerm" value="${word?.term || ''}" required>
                </div>
                <div class="form-group">
                    <label>Anlamı</label>
                    <input type="text" id="wordDefinition" value="${word?.definition || ''}" required>
                </div>
                <div class="form-group">
                    <label>Örnek Cümle</label>
                    <textarea id="wordExample">${word?.example || ''}</textarea>
                </div>
                <div class="form-group">
                    <label>Kaynak</label>
                    <select id="wordSource">
                        <option value="Modern Family" ${word?.source === 'Modern Family' ? 'selected' : ''}>Modern Family</option>
                        <option value="BBC Learning" ${word?.source === 'BBC Learning' ? 'selected' : ''}>BBC Learning</option>
                        <option value="Manuel" ${word?.source === 'Manuel' ? 'selected' : ''}>Manuel</option>
                    </select>
                </div>
                <div class="form-group">
                    <label>Notlar</label>
                    <textarea id="wordNotes">${word?.notes || ''}</textarea>
                </div>
                <div class="modal-actions">
                    <button type="submit" class="btn primary">${word ? 'Güncelle' : 'Kaydet'}</button>
                    ${word ? `<button type="button" onclick="deleteWord('${word.id}')" class="btn danger">Sil</button>` : ''}
                    <button type="button" onclick="closeWordModal()" class="btn">İptal</button>
                </div>
            </form>
        </div>
    `;
    
    document.body.appendChild(modal);
}

// Kelime kaydetme
function saveWord(event, wordId) {
    event.preventDefault();
    
    const wordData = {
        term: document.getElementById('wordTerm').value,
        definition: document.getElementById('wordDefinition').value,
        example: document.getElementById('wordExample').value,
        source: document.getElementById('wordSource').value,
        notes: document.getElementById('wordNotes').value,
        addedDate: new Date().toISOString()
    };
    
    if (wordId) {
        // Mevcut kelimeyi güncelle
        const index = vocabularyData.words.findIndex(w => w.id === wordId);
        if (index !== -1) {
            vocabularyData.words[index] = { ...vocabularyData.words[index], ...wordData };
        }
    } else {
        // Yeni kelime ekle
        vocabularyData.words.push({
            id: Date.now().toString(),
            ...wordData,
            reviews: []
        });
    }
    
    saveVocabularyData();
    renderWordList();
    closeWordModal();
    showNotification(wordId ? 'Kelime güncellendi' : 'Yeni kelime eklendi');
}

// Anki/Quizlet entegrasyonu
async function syncWithAnki() {
    try {
        const response = await fetch('http://localhost:8765', {
            method: 'POST',
            body: JSON.stringify({
                action: "addNotes",
                version: 6,
                params: {
                    notes: vocabularyData.words
                        .filter(word => !word.syncedWithAnki)
                        .map(word => ({
                            deckName: "İngilizce",
                            modelName: "Basic",
                            fields: {
                                Front: word.term,
                                Back: `${word.definition}\n\n${word.example || ''}`
                            },
                            tags: [word.source.toLowerCase().replace(' ', '_')]
                        }))
                }
            })
        });
        
        const result = await response.json();
        if (result.error) {
            throw new Error(result.error);
        }
        
        // Başarılı senkronizasyonu işaretle
        vocabularyData.words = vocabularyData.words.map(word => ({
            ...word,
            syncedWithAnki: true
        }));
        
        saveVocabularyData();
        showNotification('Kelimeler Anki\'ye aktarıldı');
    } catch (error) {
        showNotification('Anki bağlantısı başarısız: ' + error.message, 'error');
    }
}

function syncWithQuizlet() {
    // Quizlet API entegrasyonu burada olacak
    showNotification('Quizlet entegrasyonu yakında eklenecek', 'info');
}

// Kelime tekrar
function reviewWord(wordId) {
    const word = vocabularyData.words.find(w => w.id === wordId);
    if (!word) return;
    
    word.reviews = word.reviews || [];
    word.reviews.push({
        date: new Date().toISOString(),
        result: 'reviewed'
    });
    word.lastReview = new Date().toISOString();
    
    saveVocabularyData();
    renderWordList();
    showNotification('Kelime tekrar edildi');
}

// Yardımcı fonksiyonlar
function getWordStatus(word) {
    if (!word.reviews?.length) return 'Yeni';
    const daysSinceLastReview = Math.floor(
        (new Date() - new Date(word.lastReview)) / (1000 * 60 * 60 * 24)
    );
    return daysSinceLastReview <= 7 ? 'Güncel' : 'Tekrar Edilmeli';
}

function saveVocabularyData() {
    localStorage.setItem('vocabularyData', JSON.stringify(vocabularyData));
}

function showNotification(message, type = 'success') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function closeWordModal() {
    const modal = document.querySelector('.modal');
    if (modal) modal.remove();
}

// Event Listeners
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeWordModal();
    }
});