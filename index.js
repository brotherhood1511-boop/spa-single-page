// Gets important HTML elements from the page
const form = document.querySelector("#search-form");
const input = document.querySelector("#word-input");
const resultArea = document.querySelector("#result-area");
const messageArea = document.querySelector("#message-area");
const historyList = document.querySelector("#history-list");
const favoritesList = document.querySelector("#favorites-list");
const randomWordBtn = document.querySelector("#random-word-btn");
const themeToggleBtn = document.querySelector("#theme-toggle-btn");

// Loads saved history and favorite words from localStorage
let searchHistory = JSON.parse(localStorage.getItem("searchHistory")) || [];
let favoriteWords = JSON.parse(localStorage.getItem("favoriteWords")) || [];

// Words used by the random word button
const randomWords = [
    "resilient",
    "vivid",
    "logic",
    "galaxy",
    "cipher",
    "velocity",
    "ember",
    "signal"
];

// Runs when the user submits the search form
form.addEventListener("submit", function (event) {
    event.preventDefault();

    const word = input.value.trim();

    if (word === "") {
        showMessage("Please enter a word first.");
        return;
    }

    fetchWord(word);
});

// Runs when the random word button is clicked
randomWordBtn.addEventListener("click", function () {
    const randomIndex = Math.floor(Math.random() * randomWords.length);
    const randomWord = randomWords[randomIndex];

    input.value = randomWord;
    fetchWord(randomWord);
});

// Runs when the theme button is clicked
themeToggleBtn.addEventListener("click", function () {
    document.body.classList.toggle("light-mode");

    if (document.body.classList.contains("light-mode")) {
        themeToggleBtn.textContent = "Dark Mode";
    } else {
        themeToggleBtn.textContent = "Light Mode";
    }
});

// Fetches word data from the dictionary API
function fetchWord(word) {
    showMessage("Searching...");
    resultArea.innerHTML = "";

    fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`)
        .then(function (response) {
            if (!response.ok) {
                throw new Error("Word not found");
            }

            return response.json();
        })
        .then(function (data) {
            const wordData = data[0];

            displayWord(wordData);
            addToHistory(wordData.word);
            showMessage("");
        })
        .catch(function (error) {
            showError("Word not found. Try another search.");
        });
}

// Displays the fetched word data on the page
function displayWord(wordData) {
    const word = wordData.word;
    const phonetic = wordData.phonetic || "No pronunciation available";

    const meaning = wordData.meanings[0];
    const partOfSpeech = meaning.partOfSpeech || "Unknown";
    const definition = meaning.definitions[0].definition || "No definition available.";
    const example = meaning.definitions[0].example || "No example sentence available.";

    const synonyms = meaning.synonyms.length > 0 ? meaning.synonyms : [];

    const audioUrl = findAudio(wordData.phonetics);

    let synonymHTML = "";

    if (synonyms.length > 0) {
        synonyms.slice(0, 8).forEach(function (synonym) {
            synonymHTML += `<span class="tag synonym-tag">${synonym}</span>`;
        });
    } else {
        synonymHTML = "<p>No synonyms found.</p>";
    }

    let audioHTML = "";

    if (audioUrl !== "") {
        audioHTML = `
<div class="info-block">
<h3>Pronunciation Audio</h3>
<audio controls>
<source src="${audioUrl}">
</audio>
</div>
`;
    }

    resultArea.innerHTML = `
<article class="result-card">
<div class="word-title">
<h2>${word}</h2>
<button id="save-word-btn" type="button">Save Word</button>
</div>

<p class="phonetic">${phonetic}</p>

<div class="info-block">
<h3>Part of Speech</h3>
<p>${partOfSpeech}</p>
</div>

<div class="info-block">
<h3>Definition</h3>
<p>${definition}</p>
</div>

<div class="info-block">
<h3>Example</h3>
<p>${example}</p>
</div>

<div class="info-block">
<h3>Synonyms</h3>
<div class="tag-list">
${synonymHTML}
</div>
</div>

${audioHTML}
</article>
`;

    // Adds click event to the save button after it is created
    const saveWordBtn = document.querySelector("#save-word-btn");

    saveWordBtn.addEventListener("click", function () {
        saveFavorite(word);
    });

    // Adds click events to synonym tags after they are created
    const synonymTags = document.querySelectorAll(".synonym-tag");

    synonymTags.forEach(function (tag) {
        tag.addEventListener("click", function () {
            const synonymWord = tag.textContent;

            input.value = synonymWord;
            fetchWord(synonymWord);
        });
    });
}

// Finds the first available pronunciation audio file
function findAudio(phonetics) {
    for (let i = 0; i < phonetics.length; i++) {
        if (phonetics[i].audio) {
            return phonetics[i].audio;
        }
    }

    return "";
}

// Shows normal messages like loading or saved word text
function showMessage(message) {
    messageArea.textContent = message;
}

// Shows error messages and clears the result card
function showError(message) {
    messageArea.textContent = message;
    resultArea.innerHTML = "";
}

// Adds a searched word to search history
function addToHistory(word) {
    if (!searchHistory.includes(word)) {
        searchHistory.unshift(word);
    }

    if (searchHistory.length > 8) {
        searchHistory.pop();
    }

    localStorage.setItem("searchHistory", JSON.stringify(searchHistory));

    renderHistory();
}

// Displays search history tags
function renderHistory() {
    historyList.innerHTML = "";

    if (searchHistory.length === 0) {
        historyList.innerHTML = "<p>No searches yet.</p>";
        return;
    }

    searchHistory.forEach(function (word) {
        const tag = document.createElement("span");

        tag.classList.add("tag");
        tag.textContent = word;

        tag.addEventListener("click", function () {
            input.value = word;
            fetchWord(word);
        });

        historyList.appendChild(tag);
    });
}

// Saves a word to favorites
function saveFavorite(word) {
    if (!favoriteWords.includes(word)) {
        favoriteWords.unshift(word);
    }

    localStorage.setItem("favoriteWords", JSON.stringify(favoriteWords));

    renderFavorites();
    showMessage(`${word} saved to your favorites.`);
}

// Displays favorite word tags
function renderFavorites() {
    favoritesList.innerHTML = "";

    if (favoriteWords.length === 0) {
        favoritesList.innerHTML = "<p>No saved words yet.</p>";
        return;
    }

    favoriteWords.forEach(function (word) {
        const tag = document.createElement("span");

        tag.classList.add("tag");
        tag.textContent = word;

        tag.addEventListener("click", function () {
            input.value = word;
            fetchWord(word);
        });

        favoritesList.appendChild(tag);
    });
}

// Shows saved history and favorites when the page first loads
renderHistory();
renderFavorites();