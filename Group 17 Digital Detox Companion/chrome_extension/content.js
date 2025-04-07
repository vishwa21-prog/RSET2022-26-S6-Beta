console.log("Screen Time Tracker script running...");

let activeTime = 0;
setInterval(() => {
  activeTime += 1; // Increase time spent in seconds
  console.log(`Time spent on this page: ${activeTime} seconds`);
}, 1000);
