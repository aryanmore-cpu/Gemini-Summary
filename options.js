document.addEventListener("DOMContentLoaded", () => {
  // Load saved API key if it exists
  chrome.storage.sync.get(["geminiApiKey"], (result) => {
    if (result.geminiApiKey) {
      document.getElementById("api-key").value = result.geminiApiKey;
    }
  });

  // Load new settings if present
  const rateInput = document.getElementById('rate-limit');
  const summarySelect = document.getElementById('summary-length');
  if(rateInput || summarySelect){
    chrome.storage.sync.get(['rateLimit','summaryLength'], (res) => {
      if(rateInput && res.rateLimit) rateInput.value = res.rateLimit;
      if(summarySelect && res.summaryLength) summarySelect.value = res.summaryLength;
    });
  }

  // Load saved theme mode if present
  const themeCheckbox = document.getElementById('theme-checkbox');
  if (themeCheckbox) {
    chrome.storage.sync.get(['themeMode'], (res) => {
      themeCheckbox.checked = (res.themeMode === 'light');
    });
  }

  // Dirty tracking: enable Save only when changes are made
  const saveButton = document.getElementById('save-button');
  const apiInput = document.getElementById('api-key');
  function setDirty(dirty){
    if(dirty){
      saveButton.classList.remove('disabled');
    } else {
      if(!saveButton.classList.contains('disabled')) saveButton.classList.add('disabled');
    }
  }

  // Initialize as not dirty
  setDirty(false);

  // Listen for changes
  if(apiInput){
    apiInput.addEventListener('input', () => setDirty(true));
  }
  if(rateInput){ rateInput.addEventListener('input', () => setDirty(true)); }
  if(summarySelect){ summarySelect.addEventListener('change', () => setDirty(true)); }
  if(themeCheckbox){
    themeCheckbox.addEventListener('change', () => setDirty(true));
  }

  // Save API key when button is clicked
  document.getElementById("save-button").addEventListener("click", () => {
    const apiKey = document.getElementById("api-key").value.trim();
    const themeCheckbox = document.getElementById('theme-checkbox');
    const rateLimit = rateInput ? rateInput.value.trim() : null;
    const summaryLength = summarySelect ? summarySelect.value : null;
    const toSave = {};

    if (apiKey) toSave.geminiApiKey = apiKey;
    if (themeCheckbox) toSave.themeMode = themeCheckbox.checked ? 'light' : 'dark';
    if (rateLimit) toSave.rateLimit = Number(rateLimit);
    if (summaryLength) toSave.summaryLength = summaryLength;

    // At least one setting should be present
    if (Object.keys(toSave).length === 0) return;

    // show spinner in Save button
    const spinner = document.getElementById('save-spinner');
    const saveBtn = document.getElementById('save-button');
    spinner.style.display = 'inline-block';
    saveBtn.classList.add('disabled');

    chrome.storage.sync.set(toSave, () => {
      // mark not dirty after save
      setDirty(false);
      spinner.style.display = 'none';

      // show toast confirmation
      const toast = document.getElementById('toast');
      if(toast){
        toast.innerText = 'Settings saved';
        toast.style.display = 'block';
        setTimeout(() => { toast.style.display = 'none'; }, 2200);
      }
    });
  });
});
