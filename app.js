const express = require('express');
const cors = require('cors');
const dbo = require('./conn');

const PORT = 3000;
const app = express();

app.use(cors());
app.use(express.json());
app.use(require('./record'));

// Global error handling.
app.use(function (err, _req, res) {
  console.error(err.stack);
  //res.status(500).send('Something broke!');
});

// Perform a database connection when the server starts.
dbo.connectToServer(function (err) {
  if (err) {
    console.error("err");
    process.exit();
  }

  // Start the Express server.
  app.listen(PORT, () => {
    console.log(`Server is running on port: ${PORT}`);
  });
});
