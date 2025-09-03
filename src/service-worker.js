// Background Script for VT Keyboard Extension
// Handles different logic for V2 vs V3 manifests
// Works on all websites - no whitelist restrictions

// Check if we're running in V3 (has scripting API)
const isManifestV3 = typeof chrome.scripting !== 'undefined';

// Function to inject content script on all pages (V3 only)
function injectContentScript(tabId, url) {
  if (!isManifestV3 || !url) return;

  // Skip chrome:// and other internal URLs
  if (url.startsWith('chrome://') || url.startsWith('about:') || url.startsWith('data:')) {
    return;
  }

  chrome.scripting.executeScript({
    target: { tabId: tabId },
    files: ['src/content-script.js']
  });
}

// Event listeners
chrome.runtime.onInstalled.addListener(() => {
  // Extension installed - content scripts will be injected automatically for V2
  // For V3, we'll inject on tab updates
});

if (isManifestV3) {
  // Inject content script on all tab updates for V3
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      injectContentScript(tabId, tab.url);
    }
  });
}