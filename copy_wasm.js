const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, "node_modules", "@huggingface", "transformers", "dist");
const destDir = path.join(__dirname, "public", "wasm");

try {
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
    console.log("Created public/wasm/");
  }

  const files = fs.readdirSync(srcDir);
  files.forEach(file => {
    if (file.includes('wasm') || file.includes('js') || file.includes('mjs')) {
      const srcPath = path.join(srcDir, file);
      const destPath = path.join(destDir, file);
      fs.copyFileSync(srcPath, destPath);
      console.log(`Copied ${file}`);
    }
  });
  console.log("All WASM assets localized fully!");
} catch (e) {
  console.error("Localizing failed:", e);
  process.exit(1);
}
