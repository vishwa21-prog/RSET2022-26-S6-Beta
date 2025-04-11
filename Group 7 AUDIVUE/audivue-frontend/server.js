const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve about.html as the default page when root URL is accessed
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/about.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});