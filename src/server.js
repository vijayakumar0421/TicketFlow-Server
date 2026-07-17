require("dotenv").config();

console.log("DATABASE_URL:", process.env.DATABASE_URL);

const app = require("./app");

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});