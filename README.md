# Gemini Summary (Chrome extension)

A small Chrome MV3 extension that extracts article text from the current page and sends it to Google's Gemini API to produce summaries.

Quick test steps

1. Open Chrome (or Edge) and go to chrome://extensions.
2. Enable "Developer mode" and click "Load unpacked". Select this repository folder.
3. Click the extension icon (Gemini Summary). If you haven't set an API key yet, open "Settings" and paste a Gemini API key obtained from Google AI Studio (https://makersuite.google.com/app/apikey).
4. Toggle the theme (Light) in the popup or in Settings; the choice is persisted in `chrome.storage.sync.themeMode`.
5. Visit an article page, select a summary type, and click "Summarize". The extension will extract text from `<article>`, `<main>`, `<p>` or the largest `<div>` as a fallback.

Notes for developers

- API key storage: `chrome.storage.sync` under `geminiApiKey`.
- Message contract: content script listens for `GET_ARTICLE_TEXT` and responds with `{ text }` or `{ error }`.
- The Gemini API call is made from `popup.js` to `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=<API_KEY>`.
- Truncation: `popup.js` truncates long page text to 20,000 characters before sending to the API.

Files of interest

- `popup.html` / `popup.js` — UI and Gemini call.
- `content.js` — extraction heuristics.
- `options.html` / `options.js` — API key and theme settings.
- `background.js` — opens options on install if no API key set.

If you'd like a CI check, prettier/ESLint, or packaging help (zip for distribution), tell me which you'd prefer and I can add it.
