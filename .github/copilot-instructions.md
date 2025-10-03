# Copilot instructions for the Gemini-Summary extension

This repository is a small Chrome MV3 extension that extracts article text from web pages and sends it to Google's Gemini (Generative Language) API to create summaries. The guidance below highlights project-specific patterns, important files, and concrete examples to help an AI coding agent be productive.

High level
- Manifest: `manifest.json` defines a content script (`content.js`), a background service worker (`background.js`), and a popup (`popup.html`/`popup.js`). Use MV3 service-worker patterns and chrome.* APIs.
- Flow: popup -> background (not used for heavy work) -> content script. The popup requests article text from `content.js` via chrome.tabs.sendMessage and then calls the Gemini API directly from the popup (see `popup.js`).
- Storage: API key is stored in `chrome.storage.sync` under the key `geminiApiKey` (see `options.js` and `background.js`).

Files to inspect when making changes
- `popup.js` — orchestrates extraction, prepares prompts, calls Gemini REST endpoint, renders results. Modify here for API/format changes.
- `content.js` — extraction heuristics: prefers `<article>`, falls back to `<main>`, `<p>` tags, then largest `<div>`. Keep extraction changes conservative and additive.
- `options.js` / `options.html` — manages the Gemini API key UI and storage behavior. `background.js` opens options page on install if no key present.

Concrete rules and patterns
- Keep network/API calls inside `popup.js`. The extension currently calls Gemini using a fetch to a Google endpoint with ?key=<API_KEY>. If you change the API or add proxying, update `popup.js` and `manifest.json` host permissions accordingly.
- Respect MV3 background worker limitations — avoid long-running tasks in `background.js`. The project pattern uses the background script only for install-time setup.
- chrome.storage.sync usage: always use the exact key `geminiApiKey`. Read with `chrome.storage.sync.get(["geminiApiKey"], cb)` and write with `chrome.storage.sync.set({ geminiApiKey })` (see `options.js`).
- Messaging: content script exposes GET_ARTICLE_TEXT via chrome.runtime.onMessage listener. Calls expect a synchronous sendResponse payload containing either { text } or { error }.

Prompting & truncation
- `popup.js` truncates input text to 20,000 characters before sending to the API (const maxLength = 20000). Follow this limit for safety when adding new prompt flows.
- Summary types are selected by `summary-type` (`brief`, `detailed`, `bullets`). Use the same prompt templates or extend them conservatively.

Error handling and UX
- UI shows a simple loading indicator and plaintext results in `#result`. Keep UI changes minimal and preserve the existing `#result` element and `copy-btn` behavior.
- Network errors return a message surfaced to the user. When changing API error parsing, ensure the thrown Error contains useful .message text.

Testing and debugging
- Quick manual test: load the unpacked extension in Chrome/Edge (Extensions -> Load unpacked) pointing to this repo folder, set an API key in Options, then open any article page and use the popup.
- Dev-time logs: use `console.log` in `popup.js` or `content.js`; open the extension popup console via chrome://extensions -> Inspect views (popup) or inspect the page console for content script logs.

Integration points to be aware of
- Gemini REST call in `popup.js` (line that calls `generativelanguage.googleapis.com`) — changing model name, endpoint shape, or auth will require prompt and response parsing changes.
- Host permissions in `manifest.json` currently use `<all_urls>`, which enables content script injection and fetches from arbitrary pages. Be conservative when tightening or changing host permissions.

Small examples
- Extract article text: `chrome.tabs.sendMessage(tab.id, { type: 'GET_ARTICLE_TEXT' }, callback)` (see `popup.js`).
- Read API key: `chrome.storage.sync.get(['geminiApiKey'], cb)` (see `popup.js`, `options.js`).

When editing, prefer small, isolated changes and run a quick manual smoke test in the browser. Ask for clarification if you need to change API behavior, auth, or content extraction strategy.

If anything in this file is unclear or incomplete, tell me which area you want expanded (prompts, tests, error handling, or packaging) and I will update the guidance.
