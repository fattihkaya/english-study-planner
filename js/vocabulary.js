// Kelime yönetimi için veri yapısı
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

// Kelime ekleme
function showAddWordModal() {
    const modal = document.getElementById('wordModal');
    document.getElementById('wordModalTitle').textContent = 'Yeni Kelime';
    document.getElementById('wordForm').reset();
    document.getElementById('deleteWordBtn').style.display = 'none';
    modal.style.display = 'block';
}

function saveWord(event) {
    event.preventDefault();
    const form = document.getElementById('wordForm');
    const wordId = form.dataset.wordId;

    const wordData = {
        id: wordId || Date.now().toString(),
        term: document.getElementById('wordText').value,
        meaning: document.getElementById('wordMeaning').value,
        example: document.getElementById('wordExample').value,
        source: document.getElementById('wordSource').value,
        addedDate: new Date().toISOString(),
        reviews: []
    };

    if (wordId) {
        // Mevcut kelimeyi güncelle
        const index = vocabularyData.words.findIndex(w => w.id === wordId);
        if (index !== -1) {
            vocabularyData.words[index] = {
                ...vocabularyData.words[index],
                ...wordData
            };
        }
    } else {
        // Yeni kelime ekle
        vocabularyData.words.push(wordData);
    }

    saveVocabularyData();
    closeModal('wordModal');
    renderWordList();
    showNotification(wordId ? 'Kelime güncellendi' : 'Yeni kelime eklendi');
}

// Kelime düzenleme
function editWord(wordId) {
    const word = vocabularyData.words.find(w => w.id === wordId);
    if (word) {
        const modal = document.getElementById('wordModal');
        document.getElementById('wordModalTitle').textContent = 'Kelime Düzenle';
        document.getElementById('wordText').value = word.term;
        document.getElementById('wordMeaning').value = word.meaning;
        document.getElementById('wordExample').value = word.example || '';
        document.getElementById('wordSource').value = word.source;
        document.getElementById('deleteWordBtn').style.display = 'block';
        document.getElementById('wordForm').dataset.wordId = wordId;
        modal.style.display = 'block';
    }
}

// Kelime silme
function deleteWord() {
    const form = document.getElementById('wordForm');
    const wordId = form.dataset.wordId;
    
    if (confirm('Bu kelimeyi silmek istediğinize emin misiniz?')) {
        vocabularyData.words = vocabularyData.words.filter(w => w.id !== wordId);
        saveVocabularyData();
        closeModal('wordModal');
        renderWordList();
        showNotification('Kelime silindi');
    }
}

// Kelime tekrar
function reviewWord(wordId) {
    const word = vocabularyData.words.find(w => w.id === wordId);
    if (word) {
        word.reviews.push({
            date: new Date().toISOString(),
            result: 'reviewed'
        });
        word.lastReview = new Date().toISOString();
        
        saveVocabularyData();
        renderWordList();
        showNotification('Kelime tekrar edildi');
    }
}

// Anki entegrasyonu
async function exportToAnki() {
    try {
        const unsynced = vocabularyData.words.filter(word => !word.syncedWithAnki);
        if (unsynced.length === 0) {
            showNotification('Aktarılacak yeni kelime yok', 'info');
            return;
        }

        const response = await fetch('http://localhost:8765', {
            method: 'POST',
            body: JSON.stringify({
                action: "addNotes",
                version: 6,
                params: {
                    notes: unsynced.map(word => ({
                        deckName: "İngilizce",
                        modelName: "Basic",
                        fields: {
                            Front: word.term,
                            Back: `${word.meaning}\n\n${word.example || ''}`
                        },
                        tags: [word.source.toLowerCase().replace(' ', '_')]
                    }))
                }
            })
        });

        const result = await response.json();
        if (result.error) throw new Error(result.error);

        // Başarılı aktarımı işaretle
        vocabularyData.words = vocabularyData.words.map(word => ({
            ...word,
            syncedWithAnki: true
        }));

        saveVocabularyData();
        showNotification(`${unsynced.length} kelime Anki'ye aktarıldı`);
    } catch (error) {
        showNotification('Anki bağlantısı başarısız: ' + error.message, 'error');
    }
}

// Quizlet entegrasyonu
function exportToQuizlet() {
    // Quizlet API entegrasyonu gelecekte eklenecek
    showNotification('Quizlet entegrasyonu yakında eklenecek', 'info');
}

// Arama ve filtreleme
function setupSearchAndFilters() {
    const searchInput = document.getElementById('searchWord');
    searchInput.addEventListener('input', (e) => {
        vocabularyData.settings.searchTerm = e.target.value.toLowerCase();
        renderWordList();
    });

    const sourceFilter = document.getElementById('sourceFilter');
    sourceFilter.addEventListener('change', (e) => {
        vocabularyData.settings.filterSource = e.target.value;
        renderWordList();
    });

    const sortFilter = document.getElementById('sortFilter');
    sortFilter.addEventListener('change', (e) => {
        vocabularyData.settings.sortBy = e.target.value;
        renderWordList();
    });
}

// Kelime listesi render
function renderWordList() {
    const container = document.getElementById('wordList');
    if (!container) return;

    let filteredWords = filterWords();
    
    container.innerHTML = filteredWords.map(word => `
        <div class="word-item">
            <div class="word-header">
                <h3 class="word-title">${word.term}</h3>
                <div class="word-badges">
                    <span class="word-badge ${word.source.toLowerCase()}">${word.source}</span>
                    ${getReviewBadge(word)}
                </div>
            </div>
            <div class="word-meaning">${word.meaning}</div>
            ${word.example ? `
                <div class="word-example">"${word.example}"</div>
            ` : ''}
            <div class="word-actions">
                <button onclick="editWord('${word.id}')" class="btn small">Düzenle</button>
                <button onclick="reviewWord('${word.id}')" class="btn small">Tekrar Et</button>
                <button onclick="exportWordToAnki('${word.id}')" class="btn small">Anki'ye Ekle</button>
            </div>
        </div>
    `).join('');
}

// Yardımcı fonksiyonlar
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
        filtered = filtered.filter(word =>
            word.term.toLowerCase().includes(vocabularyData.settings.searchTerm) ||
            word.meaning.toLowerCase().includes(vocabularyData.settings.searchTerm)
        );
    }
    
    // Sıralama
    filtered.sort((a, b) => {
        switch (vocabularyData.settings.sortBy) {
            case 'az':
                return a.term.localeCompare(b.term);
            case 'za':
                return b.term.localeCompare(a.term);
            default: // date
                return new Date(b.addedDate) - new Date(a.addedDate);
        }
    });
    
    return filtered;
}

function getReviewBadge(word) {
    if (!word.reviews?.length) return '<span class="word-badge new">Yeni</span>';
    
    const daysSinceLastReview = Math.floor(
        (new Date() - new Date(word.lastReview)) / (1000 * 60 * 60 * 24)
    );
    
    return daysSinceLastReview <= 7 
        ? '<span class="word-badge reviewed">Güncel</span>'
        : '<span class="word-badge review">Tekrar Edilmeli</span>';
}

// Veri yönetimi
function saveVocabularyData() {
    localStorage.setItem('vocabularyData', JSON.stringify(vocabularyData));
}

function loadVocabularyData() {
    const saved = localStorage.getItem('vocabularyData');
    if (saved) {
        vocabularyData = JSON.parse(saved);
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