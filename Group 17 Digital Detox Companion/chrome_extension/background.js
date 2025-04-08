let activeTabId = null;
let startTime = null;
let currentUrl = null;

// Function to dynamically import Firebase
async function logScreenTimeWrapper(url, duration, category) {
  try {
    const { logScreenTime } = await import('./firebase.js'); // Dynamic Import
    await logScreenTime(url, duration, category);
    console.log(`Logged: ${url} for ${duration}s (${category})`);
  } catch (error) {
    console.error("Failed to log to Firebase:", error);
  }
}

// Track time spent on tabs
async function trackTabTime(tabId, url) {
  if (!startTime || !currentUrl) return;

  const duration = Math.floor((Date.now() - startTime) / 1000);
  if (duration > 1) { // Only log if more than 1 second
    const category = categorizeWebsite(currentUrl);
    logScreenTimeWrapper(currentUrl, duration, category);
  }

  // Reset for new tab
  startTime = Date.now();
  currentUrl = url;
}

// Website categorization
function categorizeWebsite(url) {
  if (!url) return 'other';

  try {
    const urlObj = new URL(url);
    const host = urlObj.hostname;

    const workSites = ['github.com', 'stackoverflow.com', 'docs.google.com'];
    const entertainmentSites = ['youtube.com', 'netflix.com', 'facebook.com'];

    if (workSites.some(site => host.includes(site))) return 'work';
    if (entertainmentSites.some(site => host.includes(site))) return 'entertainment';
    return 'other';
  } catch {
    return 'other';
  }
}

// Tab event listeners
chrome.tabs.onActivated.addListener(activeInfo => {
  chrome.tabs.get(activeInfo.tabId, tab => {
    if (tab.url) {
      trackTabTime(activeInfo.tabId, tab.url);
      activeTabId = activeInfo.tabId;
    }
  });
});

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (tabId === activeTabId && changeInfo.url) {
    trackTabTime(tabId, changeInfo.url);
  }
});

chrome.tabs.onRemoved.addListener(tabId => {
  if (tabId === activeTabId) {
    trackTabTime(tabId, null);
    activeTabId = null;
    startTime = null;
    currentUrl = null;
  }
});

// Initialize
chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
  if (tabs[0]) {
    activeTabId = tabs[0].id;
    currentUrl = tabs[0].url;
    startTime = Date.now();
  }
});
