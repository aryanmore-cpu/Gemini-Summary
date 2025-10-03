// Initialize theme toggle on load
document.addEventListener('DOMContentLoaded', () => {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  // Load saved themeMode (default to GS_CONFIG.defaults.themeMode)
  chrome.storage.sync.get(['themeMode'], (res) => {
    const mode = res.themeMode || window.GS_CONFIG.defaults.themeMode;
    window.GS_CONFIG.applyThemeMode(mode);
    themeToggle.checked = mode === 'light';
  });

  themeToggle.addEventListener('change', () => {
    const mode = themeToggle.checked ? 'light' : 'dark';
    window.GS_CONFIG.applyThemeMode(mode);
    chrome.storage.sync.set({ themeMode: mode });
  });
});

// Open options/settings in a new tab when the small gear button is clicked
const openSettingsBtn = document.getElementById('open-settings');
if(openSettingsBtn){
  openSettingsBtn.addEventListener('click', () => {
    if (chrome.runtime && chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // fallback to opening options.html directly
      window.open(chrome.runtime.getURL('options.html'));
    }
  });
}

document.getElementById("summarize").addEventListener("click", async () => {
  const resultDiv = document.getElementById("result");
  resultDiv.innerHTML = '<div class="loading"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>';

  const summaryType = document.getElementById("summary-type").value;

  // Get API key from storage
  chrome.storage.sync.get(["geminiApiKey"], async (result) => {
    if (!result.geminiApiKey) {
      resultDiv.innerHTML =
        "API key not found. Please set your API key in the extension options.";
      return;
    }

    chrome.tabs.query({ active: true, currentWindow: true }, ([tab]) => {
      chrome.tabs.sendMessage(
        tab.id,
        { type: "GET_ARTICLE_TEXT" },
        async (res) => {
          if (!res || !res.text) {
            resultDiv.innerText = res && res.error ? res.error : "Could not extract article text from this page.";
            return;
          }

          try {
            const summary = await getGeminiSummary(
              res.text,
              summaryType,
              result.geminiApiKey
            );
            resultDiv.innerText = summary;
          } catch (error) {
            resultDiv.innerText = `Error: ${error.message || error}\nDetails: ${typeof error === 'object' ? JSON.stringify(error, null, 2) : error}`;
          }
        }
      );
    });
  });
});

document.getElementById("copy-btn").addEventListener("click", () => {
  const summaryText = document.getElementById("result").innerText;

  if (summaryText && summaryText.trim() !== "") {
    navigator.clipboard
      .writeText(summaryText)
      .then(() => {
        const copyBtn = document.getElementById("copy-btn");
        const originalText = copyBtn.innerText;

        copyBtn.innerText = "Copied!";
        setTimeout(() => {
          copyBtn.innerText = originalText;
        }, 2000);
      })
      .catch((err) => {
        console.error("Failed to copy text: ", err);
      });
  }
});

async function getGeminiSummary(text, summaryType, apiKey) {
  // Truncate very long texts to avoid API limits (typically around 30K tokens)
  const maxLength = 20000;
  const truncatedText =
    text.length > maxLength ? text.substring(0, maxLength) + "..." : text;

  let prompt;
  switch (summaryType) {
    case "brief":
      prompt = `Provide a brief summary of the following article in 2-3 sentences:\n\n${truncatedText}`;
      break;
    case "detailed":
      prompt = `Provide a detailed summary of the following article, covering all main points and key details:\n\n${truncatedText}`;
      break;
    case "bullets":
      prompt = `Summarize the following article in 5-7 key points. Format each point as a line starting with "- " (dash followed by a space). Do not use asterisks or other bullet symbols, only use the dash. Keep each point concise and focused on a single key insight from the article:\n\n${truncatedText}`;
      break;
    default:
      prompt = `Summarize the following article:\n\n${truncatedText}`;
  }

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
          },
        }),
      }
    );

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.error?.message || "API request failed");
    }

    const data = await res.json();
    return (
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "No summary available."
    );
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to generate summary. Please try again later.");
  }
}
