const fs = require('fs');
const path = require('path');

const src = "C:\\Users\\Game\\.gemini\\antigravity\\brain\\ee0cfd9f-9c17-470b-aa98-e4ac688067a3\\skorea_map_black_neon_1773932716041.png";
const destDir = path.join(__dirname, "public");
const dest = path.join(destDir, "map.png");

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir);
    console.log("Created public/ directory");
  }
  
  fs.copyFileSync(src, dest);
  console.log("Successfully copied map.png to public/");
} catch (e) {
  console.error("Copy failed:", e);
  process.exit(1);
}
