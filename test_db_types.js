const { createClient } = require("@libsql/client");
const { drizzle } = require("drizzle-orm/libsql");
const fs = require('fs');

try {
  const envText = fs.readFileSync('.env', 'utf-8');
  const env = {};
  envText.split('\n').forEach(line => {
    const parts = line.split('=');
    if (parts.length >= 2) {
      const key = parts[0].trim();
      const value = parts.slice(1).join('=').trim().replace(/^"|"$/g, '');
      env[key] = value;
    }
  });

  const tursoClient = createClient({
    url: env.TURSO_DATABASE_URL,
    authToken: env.TURSO_AUTH_TOKEN,
  });

  async function test() {
    const res = await tursoClient.execute("SELECT id, content, created_at FROM guestbook LIMIT 3");
    console.log("📋 RAW TURSO DB ROWS:", JSON.stringify(res.rows, null, 2));
  }

  test();
} catch (e) {
  console.error("Test failed:", e);
}
