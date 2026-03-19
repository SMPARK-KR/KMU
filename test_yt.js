const { YouTube } = require('youtubei.js');

async function test() {
  try {
    console.log("Loading YouTube...");
    const yt = await YouTube.init();
    const videoId = "aqz-KE-bpKQ"; // Sample video id
    console.log(`Fetching info for ${videoId}...`);
    const info = await yt.getInfo(videoId);
    
    // Choose format
    const format = info.chooseFormat({ type: 'video+audio', quality: 'best' });
    if (!format) {
      console.log("No format found");
      return;
    }
    
    console.log("Format found:");
    console.log("Quality:", format.quality_label);
    console.log("Type:", format.mime_type);
    console.log("URL is available:", !!format.url);
    
    if (format.decipher) {
      console.log("Decipher method exists");
    }
    
    const url = format.url; // Or call format.decipher?
    console.log("Stream URL length:", url ? url.length : 0);
    if (url) {
      console.log("Starts with:", url.substring(0, 50));
    }
    
  } catch (e) {
    console.error("Test Error:", e);
  }
}

test();
