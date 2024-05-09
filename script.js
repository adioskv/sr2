let analysisWindow = null;

function analyzeText() {
  if (analysisWindow && !analysisWindow.closed) {
    analysisWindow.close();
  }

  const textInput = document.getElementById('textInput');
  const text = textInput.value.trim();

  const errorElement = document.getElementById('error');

  if (!text) {
    errorElement.innerText = "Текстове поле не має бути пустим";

    setTimeout(() => {
      errorElement.innerText = '';
    }, 3000);

    return;
  }

  const clearText = text.replace(/[^\p{L}\s]/gu, ' ');
  const words = clearText.toLowerCase().split(/\s+/).filter(word => word.length > 0);

  const wordCount = {};
  words.forEach(word => {
    wordCount[word] = (wordCount[word] || 0) + 1;
  });

  const sortedWordCount = Object.fromEntries(
    Object.entries(wordCount).sort(([, a], [, b]) => b - a)
  );

  analysisWindow = window.open('', 'Результати', 'width=1280, height=720');
  analysisWindow.document.write(`
    <html>
    <head>
      <title>Text Analysis</title>
      <style>
        table, th, td {
          border: 1px solid black;
        }

        th, td {
          padding: 8px;
          text-align: left;
        }

        .wrapper {
          display: flex;
          gap: 16px;
        }

        .highlight {
          background-color: yellow;
        }
      </style>
    </head>
    <body>
      <h2>Результати аналізу</h2>
      <div class="wrapper">
      <table>
        <tr>
          <th>Слово</th>
          <th>Кількість</th>
        </tr>
  `);

  Object.entries(sortedWordCount).forEach(([word, count]) => {
    analysisWindow.document.write(`
        <tr>
          <td>${word}</td>
          <td>${count}</td>
        </tr>
      `);
  });

  analysisWindow.document.write(`
    </table>
    <div>
      <form id="searchForm">
        <input type="text" id="searchInput" list="suggestions"></input>
        <datalist id="suggestions"></datalist>
        <button type="submit">Пошук</button>
        <button id="clearButton">Очистити</button>
      </form>
      <p>${text}</p>
    </div>
  </div>
  </body>
  </html>
  `);

  const suggestionsList = analysisWindow.document.getElementById("suggestions");
  const originalText = analysisWindow.document.querySelector('p');
  const clearButton = analysisWindow.document.getElementById('clearButton');
  const searchInput = analysisWindow.document.getElementById('searchInput');
  const searchForm = analysisWindow.document.getElementById('searchForm');
  
  searchInput.addEventListener("input", handleUpdateSuggestions);
  
  clearButton.addEventListener("click", (event) => {
    event.preventDefault();
    searchInput.value = ''
    handleClearHighlights();
  })
  
  searchForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const searchValue = searchInput.value.trim();
    if (searchValue) {
      handleClearHighlights();
      handleHighlightWord(searchValue);
    } else {
      handleClearHighlights();
    }
  });

  function handleHighlightWord(word) {
    const regex = new RegExp(`(?<!\\p{L})${word}(?!\\p{L})`, 'gui');
    const content = originalText.innerHTML;
    const highlightedContent = content.replace(regex, `<span class="highlight">$&</span>`);
    originalText.innerHTML = highlightedContent;
  };

  function handleUpdateSuggestions() {
    const inputText = searchInput.value.toLowerCase().trim();
    const matchingWords = Object.keys(sortedWordCount).filter(word =>
      word.toLowerCase().startsWith(inputText)
    );

    suggestionsList.innerHTML = "";

    matchingWords.forEach(word => {
      const optionItem = document.createElement("option");
      optionItem.value = word;
      suggestionsList.appendChild(optionItem);
    });
  }

  function handleClearHighlights() {
    originalText.innerHTML = text;
  };
}
