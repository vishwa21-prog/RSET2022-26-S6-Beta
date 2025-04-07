import { getScreenTimeLogs } from './firebase.js';

document.addEventListener('DOMContentLoaded', async () => {
  await updateTimeDisplay();
  setInterval(updateTimeDisplay, 5000); // Update every 5 seconds
});

async function updateTimeDisplay() {
  try {
    // Get data from both local storage and Firestore
    const [localData, firestoreData] = await Promise.all([
      new Promise(resolve => {
        chrome.storage.local.get(['tabData'], (result) => {
          resolve(result.tabData || {});
        });
      }),
      getScreenTimeLogs()
    ]);
    
    // Combine and calculate totals
    const totals = { work: 0, entertainment: 0, other: 0 };
    
    // Process local data
    Object.values(localData).forEach(tab => {
      totals[tab.category] += tab.totalTime;
    });
    
    // Process Firestore data
    firestoreData.forEach(log => {
      totals[log.category] += log.duration;
    });
    
    // Update UI
    document.getElementById('work-time').textContent = formatTime(totals.work);
    document.getElementById('entertainment-time').textContent = formatTime(totals.entertainment);
    document.getElementById('other-time').textContent = formatTime(totals.other);
    document.getElementById('total-time-display').textContent = 
      formatTime(totals.work + totals.entertainment + totals.other);
    
  } catch (error) {
    console.error("Error updating display:", error);
  }
}

function formatTime(seconds) {
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
}