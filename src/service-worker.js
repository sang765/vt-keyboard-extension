// Background Script for VT Keyboard Extension
// Handles different logic for V2 vs V3 manifests

let whitelist = [];

// Check if we're running in V3 (has scripting API)
const isManifestV3 = typeof chrome.scripting !== 'undefined';

// Function to update declarative content rules based on whitelist (V3 only)
function updateDeclarativeRules() {
  if (isManifestV3 && chrome.declarativeContent) {
    chrome.declarativeContent.onPageChanged.removeRules(undefined, () => {
      const rules = whitelist.map(domain => ({
        conditions: [
          new chrome.declarativeContent.PageStateMatcher({
            pageUrl: { hostSuffix: domain }
          })
        ],
        actions: [new chrome.declarativeContent.ShowAction()]
      }));
      chrome.declarativeContent.onPageChanged.addRules(rules);
    });
  }
}

// Load whitelist from storage and update rules
function loadWhitelist() {
  chrome.storage.sync.get(['whitelist'], (result) => {
    whitelist = result.whitelist || ['docs.google.com', 'notion.so', 'etherpad.net'];
    updateDeclarativeRules();
  });
}

// Inject content script if domain is whitelisted (V3 only)
function injectContentScript(tabId, url) {
  if (!isManifestV3 || !url) return;
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  if (whitelist.some(w => domain.endsWith(w))) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['src/content-script.js']
    });
  }
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  loadWhitelist();
});

if (isManifestV3) {
  chrome.runtime.onStartup.addListener(() => {
    loadWhitelist();
  });

  // Listen for storage changes to update whitelist (V3 only)
  chrome.storage.onChanged.addListener((changes, namespace) => {
    if (namespace === 'sync' && changes.whitelist) {
      whitelist = changes.whitelist.newValue || [];
      updateDeclarativeRules();
    }
  });

  // Inject content script on tab updates (V3 only)
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      injectContentScript(tabId, tab.url);
    }
  });
}