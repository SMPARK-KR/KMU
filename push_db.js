const { execSync } = require('child_process');
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

  console.log("Connecting to:", env.TURSO_DATABASE_URL);

  execSync('npx drizzle-kit push', {
    env: {
      ...process.env,
      TURSO_CONNECTION_URL: env.TURSO_DATABASE_URL,
      TURSO_AUTH_TOKEN: env.TURSO_AUTH_TOKEN
    },
    stdio: 'inherit'
  });
  console.log("Schema Pushed Successfully!");
} catch (e) {
  console.error("Push failed:", e);
  process.exit(1);
}
