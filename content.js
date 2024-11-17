// Modern Family verisi
let contentData = {
    currentSeason: 1,
    seasons: [
        {
            number: 1,
            episodes: [
                {
                    id: 's01e01',
                    title: 'Pilot',
                    duration: 25,
                    watched: false,
                    notes: '',
                    vocabulary: [],
                    phrases: []
                }
                // Diğer bölümler
            ]
        }
        // Diğer sezonlar
    ]
};

// Sayfa yüklendiğinde
document.addEventListener('DOMContentLoaded', () => {
    loadContentData();
    renderSeasonSelector();
    renderEpisodes();
});

// Verileri yükle
function loadContentData() {
    const saved = localStorage.getItem('contentData');
    if (saved) {
        contentData = JSON.parse(saved);
    }
}

// Sezon seçiciyi render et
function renderSeasonSelector() {
    const selector = document.querySelector('.season-selector');
    selector.innerHTML = contentData.seasons.map(season => `
        <button 
            class="season-btn ${season.number === contentData.currentSeason ? 'active' : ''}"
            onclick="changeSeason(${season.number})">
            Sezon ${season.number}
        </button>
    `).join('');
}

// Bölümleri render et
function renderEpisodes() {
    const currentSeason = contentData.seasons.find(s => s.number === contentData.currentSeason);
    const grid = document.querySelector('.episode-grid');

    grid.innerHTML = currentSeason.episodes.map(episode => `
        <div class="episode-card ${episode.watched ? 'watched' : ''}">
            <div class="episode-header">
                <span class="episode-number">S${String(currentSeason.number).padStart(2, '0')}E${String(episode.id.split('e')[1]).padStart(2, '0')}</span>
                <span class="episode-duration">${episode.duration}dk</span>
            </div>
            <h3 class="episode-title">${episode.title}</h3>
            <div class="episode-stats">
                <span>📝 ${episode.vocabulary.length} kelime</span>
                <span>💡 ${episode.phrases.length} kalıp</span>
            </div>
            <div class="episode-progress">
                <div class="progress-bar">
                    <div class="progress" style="width: ${episode.watched ? '100%' : '0%'}"></div>
                </div>
                <span>${episode.watched ? 'Tamamlandı' : 'İzlenmedi'}</span>
            </div>
            <button onclick="showEpisodeDetails('${episode.id}')" class="btn">Detayları Gör</button>
        </div>
    `).join('');
}

// Sezon değiştir
function changeSeason(seasonNumber) {
    contentData.currentSeason = seasonNumber;
    saveContentData();
    renderSeasonSelector();
    renderEpisodes();
}

// Bölüm detaylarını göster
function showEpisodeDetails(episodeId) {
    const episode = findEpisode(episodeId);
    if (!episode) return;

    // Modal içeriğini oluştur
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.innerHTML = `
        <div class="modal-content wide">
            <div class="episode-detail-header">
                <h2>${formatEpisodeNumber(episodeId)} - ${episode.title}</h2>
                <div class="tab-buttons">
                    <button onclick="switchDetailTab('notes')" class="tab-btn active">Notlar</button>
                    <button onclick="switchDetailTab('vocabulary')" class="tab-btn">Kelimeler</button>
                    <button onclick="switchDetailTab('phrases')" class="tab-btn">Kalıplar</button>
                </div>
            </div>

            <div class="tab-content notes active">
                <textarea 
                    class="note-area" 
                    placeholder="Bölüm notlarınızı buraya yazın..."
                    onchange="saveEpisodeNotes('${episodeId}', this.value)"
                >${episode.notes}</textarea>
            </div>

            <div class="tab-content vocabulary">
                ${renderVocabularyList(episode.vocabulary)}
                <button onclick="addWordToEpisode('${episodeId}')" class="btn primary">
                    + Yeni Kelime
                </button>
            </div>

            <div class="tab-content phrases">
                ${renderPhraseList(episode.phrases)}
                <button onclick="addPhraseToEpisode('${episodeId}')" class="btn primary">
                    + Yeni Kalıp
                </button>
            </div>

            <div class="modal-actions">
                <button onclick="toggleEpisodeWatched('${episodeId}')" class="btn ${episode.watched ? 'success' : 'primary'}">
                    ${episode.watched ? '✓ İzlendi' : 'İzlendi İşaretle'}
                </button>
                <button onclick="closeModal()" class="btn">Kapat</button>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
}

// Kelime/Kalıp ekleme fonksiyonları
function addWordToEpisode(episodeId) {
    const episode = findEpisode(episodeId);
    const word = prompt('Yeni kelime:');
    const definition = prompt('Anlamı:');
    
    if (word && definition) {
        episode.vocabulary.push({
            term: word,
            definition: definition,
            addedDate: new Date().toISOString()
        });
        
        saveContentData();
        showEpisodeDetails(episodeId); // Modal'ı yenile
    }
}

function addPhraseToEpisode(episodeId) {
    const episode = findEpisode(episodeId);
    const phrase = prompt('Yeni kalıp:');
    const meaning = prompt('Anlamı:');
    const example = prompt('Örnek cümle:');
    
    if (phrase && meaning) {
        episode.phrases.push({
            expression: phrase,
            meaning: meaning,
            example: example,
            addedDate: new Date().toISOString()
        });
        
        saveContentData();
        showEpisodeDetails(episodeId); // Modal'ı yenile
    }
}

// Yardımcı fonksiyonlar
function findEpisode(episodeId) {
    const season = contentData.seasons.find(s => s.number === contentData.currentSeason);
    return season.episodes.find(e => e.id === episodeId);
}

function formatEpisodeNumber(episodeId) {
    const [season, episode] = episodeId.replace('s', '').replace('e', ' ').split(' ');
    return `S${season.padStart(2, '0')}E${episode.padStart(2, '0')}`;
}

function saveContentData() {
    localStorage.setItem('contentData', JSON.stringify(contentData));
}

function closeModal() {
    document.querySelector('.modal').remove();
}
