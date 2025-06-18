// Download and filter the word list
async function createCleanWordList() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/redbo/scrabble/master/dictionary.txt",
    );
    const text = await response.text();

    const rawWords = text
      .split("\n")
      .map((word) => word.trim().toUpperCase())
      .filter((word) => word.length >= 3 && word.length <= 11);

    console.log(`Starting with ${rawWords.length} raw words`);

    // Apply filters
    const filteredWords = rawWords
      .filter(removeInappropriateWords)
      .filter(removeObscureWords)
      .filter(removeProperNouns)
      .filter(onlyCommonLetters);

    console.log(`After filtering: ${filteredWords.length} clean words`);

    return new Set(filteredWords);
  } catch (error) {
    console.error("Failed to load dictionary:", error);
    return new Set();
  }
}

async function createCommonWordList() {
  try {
    const response = await fetch(
      "https://raw.githubusercontent.com/arstgit/high-frequency-vocabulary/refs/heads/master/30k.txt",
    );
    const text = await response.text();

    const rawWords = text
      .split("\n")
      .map((word) => word.trim().toUpperCase())
      .filter((word) => word.length >= 3 && word.length <= 11);

    console.log(`Starting with ${rawWords.length} raw words`);

    // Apply filters
    const filteredWords = rawWords
      .filter(removeInappropriateWords)
      .filter(removeObscureWords)
      .filter(removeProperNouns)
      .filter(onlyCommonLetters);

    console.log(`After filtering: ${filteredWords.length} clean words`);

    return new Set(filteredWords);
  } catch (error) {
    console.error("Failed to load dictionary:", error);
    return new Set();
  }
}
// Filter functions
function removeInappropriateWords(word) {
  // Basic inappropriate word filter - you'll want to expand this list
  const inappropriateWords = new Set([
    // Add your filter list here - I won't include examples
    // You can find curated lists online for this purpose
  ]);

  return !inappropriateWords.has(word);
}

function removeObscureWords(word) {
  // Remove very uncommon words, archaic terms, etc.
  const obscurePatterns = [
    /^[AEIOU]{3,}/, // Words with too many consecutive vowels
    /[QX](?![U])/, // Q not followed by U, or X in uncommon positions
    /^[BCDFGHJKLMNPQRSTVWXYZ]{4,}$/, // Words with too many consecutive consonants
  ];

  // Remove words that match obscure patterns
  return !obscurePatterns.some((pattern) => pattern.test(word));
}

function removeProperNouns(word) {
  // Scrabble dictionary shouldn't have these, but just in case
  const properNouns = new Set([
    "MARS",
    "VENUS",
    "EARTH", // You might want to keep some space-related ones
    // Add others as needed
  ]);

  // Keep space-related proper nouns for your theme
  const spaceTerms = new Set(["MARS", "VENUS", "EARTH", "PLUTO", "SATURN"]);

  return !properNouns.has(word) || spaceTerms.has(word);
}

function onlyCommonLetters(word) {
  // Remove words with uncommon letter combinations
  const uncommonCombos = [
    /CWM/,
    /CWZ/,
    /FWD/,
    /GWR/,
    /HWL/,
    /JWL/,
    /KWA/,
    /LWR/,
    /MWR/,
    /NWR/,
    /PWR/,
    /QWE/,
    /RWE/,
    /SWR/,
    /TWR/,
    /VWR/,
    /WXY/,
    /XYZ/,
    /ZYX/,
    /ZZY/,
    /ZZX/,
    /YYZ/,
    /YYX/,
    /XXY/,
    /XXZ/,
  ];

  return !uncommonCombos.some((combo) => combo.test(word));
}

// Additional utility functions
function exportWordList(wordSet, filename = "clean_words.txt") {
  // Convert to downloadable file
  const wordArray = Array.from(wordSet).sort();
  const content = wordArray.join("\n");

  const blob = new Blob([content], { type: "text/plain" });
  const url = URL.createObjectURL(blob);

  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();

  URL.revokeObjectURL(url);
}

function analyzeWordList(wordSet) {
  const words = Array.from(wordSet);
  const analysis = {
    total: words.length,
    byLength: {},
    commonLetters: {},
    longestWords: words.filter((w) => w.length >= 8).slice(0, 20),
  };

  // Count by length
  words.forEach((word) => {
    const len = word.length;
    analysis.byLength[len] = (analysis.byLength[len] || 0) + 1;

    // Count letter frequency
    word.split("").forEach((letter) => {
      analysis.commonLetters[letter] =
        (analysis.commonLetters[letter] || 0) + 1;
    });
  });

  return analysis;
}

// Usage example:
async function setupGameDictionary() {
  console.log("Loading and filtering dictionary...");

  const cleanWords = await createCleanWordList();
  const commonWords = await createCommonWordList();
  const intersectionWords = commonWords.intersection(cleanWords);

  const analysis = analyzeWordList(intersectionWords);

  console.log("Dictionary Analysis:", analysis);

  // Export for backup/review
  exportWordList(cleanWords, "solar_word_game_dictionary.txt");

  // Use in your game
  return cleanWords;
}

// Call this when setting up your game
// setupGameDictionary().then((dictionary) => {
//     // Now test your puzzle with the clean dictionary
//     const result = findAllPossibleWords(
//         gameState.letters,
//         gameState.rings,
//         gameState.sun.letter,
//         dictionary,
//     );

//     console.log(
//         `Your puzzle can create ${result.totalWords} words:`,
//         result.words,
//     );
// });
