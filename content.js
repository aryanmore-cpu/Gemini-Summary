function getArticleText() {
  const article = document.querySelector("article");
  if (article && article.innerText.trim()) return article.innerText.trim();

  // fallback: try <main>
  const main = document.querySelector("main");
  if (main && main.innerText.trim()) return main.innerText.trim();

  // fallback: try all <p>
  const paragraphs = Array.from(document.querySelectorAll("p"));
  const paraText = paragraphs.map((p) => p.innerText.trim()).filter(Boolean).join("\n");
  if (paraText) return paraText;

  // fallback: try largest <div>
  const divs = Array.from(document.querySelectorAll("div"));
  let largestDiv = "";
  divs.forEach(div => {
    const text = div.innerText.trim();
    if (text.length > largestDiv.length) largestDiv = text;
  });
  if (largestDiv) return largestDiv;

  // nothing found
  return null;
}

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  if (req.type === "GET_ARTICLE_TEXT") {
    const text = getArticleText();
    if (text) {
      sendResponse({ text });
    } else {
      sendResponse({ error: "Could not extract article text from this page." });
    }
  }
});
