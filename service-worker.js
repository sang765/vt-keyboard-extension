// Service Worker for VT Keyboard Extension
// Handles declarative content rules and dynamic content script injection

let whitelist = [];

// Function to update declarative content rules based on whitelist
function updateDeclarativeRules() {
  if (chrome.declarativeContent) {
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

// Inject content script if domain is whitelisted
function injectContentScript(tabId, url) {
  if (!url) return;
  const urlObj = new URL(url);
  const domain = urlObj.hostname;
  if (whitelist.some(w => domain.endsWith(w))) {
    chrome.scripting.executeScript({
      target: { tabId: tabId },
      files: ['content-script.js']
    });
  }
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  loadWhitelist();
});

chrome.runtime.onStartup.addListener(() => {
  loadWhitelist();
});

// Listen for storage changes to update whitelist
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'sync' && changes.whitelist) {
    whitelist = changes.whitelist.newValue || [];
    updateDeclarativeRules();
  }
});

// Inject content script on tab updates
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url) {
    injectContentScript(tabId, tab.url);
  }
});