function getSnippet(fullText, query, maxSentences = 3) {
  const lowerText = fullText.toLowerCase();
  const lowerQuery = query.toLowerCase();
  let index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return fullText.substring(0, 300) + '...';
  
  // Find start of the sentence
  let start = index;
  while (start > 0 && fullText[start] !== '.' && fullText[start] !== '?' && fullText[start] !== '!') {
    start--;
  }
  if (start > 0) start++; // Move past the punctuation
  
  // Find end of the sentence
  let end = index + query.length;
  let sentencesFound = 0;
  while (end < fullText.length && sentencesFound < maxSentences) {
    if (fullText[end] === '.' || fullText[end] === '?' || fullText[end] === '!') {
      sentencesFound++;
    }
    end++;
  }
  
  let snippet = fullText.substring(start, end).trim();
  // Optional: if snippet is too long, we might still want to truncate, but let's just return it
  return snippet;
}

const text = "Ini adalah contoh kalimat pertama. Dan janganlah kamu mendekati zina; sesungguhnya zina itu adalah suatu perbuatan yang keji dan suatu jalan yang buruk. Dan Allah SWT juga berfirman tentang dosa yang lain. Ini adalah kalimat keempat.";

console.log(getSnippet(text, "zina"));
