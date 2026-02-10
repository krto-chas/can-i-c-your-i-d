// index.js
const express = require("express");

const app = express();

// (valfritt) middleware
app.use(express.json());

// Health/status endpoint som testen förväntar sig
app.get("/status", (req, res) => {
  res.json({ status: "ok" });
});

// Exportera appen för tester och annan användning
module.exports = app;

// Starta bara servern om denna fil körs direkt:
//   node index.js
// Inte när den importeras (t.ex. i test.js)
if (require.main === module) {
  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}
