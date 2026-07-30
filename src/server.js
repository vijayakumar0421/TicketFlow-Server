require("dotenv").config();

const app = require("./app");

const PORT = process.env.PORT || 5000;

// Check that DATABASE_URL exists without exposing it
if (!process.env.DATABASE_URL) {
  console.error("❌ DATABASE_URL is not set.");
  process.exit(1);
}

console.log("✅ DATABASE_URL loaded");
console.log(`🚀 Starting TicketFlow Server...`);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});