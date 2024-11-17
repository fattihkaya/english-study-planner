// Modern Family fonksiyonları
let episodes = {
    currentSeason: 1,
    seasons: {
        1: {
            episodes: [
                {id: 'S01E01', title: 'Pilot', watched: false, notes: '', words: [], phrases: []}
            ]
        }
    }
};

document.addEventListener('DOMContentLoaded', function() {
    loadEpisodes();
    renderEpisodes();
});

function addWord(episodeId) {
    const episode = findEpisode(episodeId);
    const word = document.getElementById('newWord').value;
    const meaning = document.getElementById('wordMeaning').value;

    if(word && meaning && episode) {
        episode.words.push({word, meaning, date: new Date()});
        saveEpisodes();
        renderEpisodeDetails(episodeId);
    }
}

function addPhrase(episodeId) {
    const episode = findEpisode(episodeId);
    const phrase = document.getElementById('newPhrase').value;
    const meaning = document.getElementById('phraseMeaning').value;

    if(phrase && meaning && episode) {
        episode.phrases.push({phrase, meaning, date: new Date()});
        saveEpisodes();
        renderEpisodeDetails(episodeId);
    }
}

function findEpisode(episodeId) {
    const season = episodes.seasons[episodes.currentSeason];
    return season.episodes.find(ep => ep.id === episodeId);
}

function saveEpisodes() {
    localStorage.setItem('modernFamily', JSON.stringify(episodes));
}

function loadEpisodes() {
    const saved = localStorage.getItem('modernFamily');
    if(saved) {
        episodes = JSON.parse(saved);
    }
}

function renderEpisodes() {
    const season = episodes.seasons[episodes.currentSeason];
    const container = document.getElementById('episodes-list');
    if(container) {
        container.innerHTML = season.episodes.map(episode => `
            <div class="episode" onclick="showEpisodeDetails('${episode.id}')">
                <h3>${episode.title}</h3>
                <span>${episode.watched ? '✓ İzlendi' : 'İzlenmedi'}</span>
            </div>
        `).join('');
    }
}

function renderEpisodeDetails(episodeId) {
    const episode = findEpisode(episodeId);
    if(episode) {
        const modal = document.getElementById('episodeModal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${episode.title}</h2>
                <textarea id="episodeNotes">${episode.notes}</textarea>
                <div class="words-list">
                    ${episode.words.map(w => `
                        <div class="word-item">
                            <span>${w.word} - ${w.meaning}</span>
                        </div>
                    `).join('')}
                </div>
                <div class="phrases-list">
                    ${episode.phrases.map(p => `
                        <div class="phrase-item">
                            <span>${p.phrase} - ${p.meaning}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        modal.style.display = 'block';
    }
}