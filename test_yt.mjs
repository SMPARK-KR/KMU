import { Innertube } from 'youtubei.js';

async function test() {
  try {
    console.log("Loading Innertube...");
    const yt = await Innertube.create();
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
    console.log("Mime Type:", format.mime_type);
    console.log("URL is available:", !!format.url);
    
    const url = format.url; 
    console.log("Stream URL length:", url ? url.length : 0);
    if (url) {
       console.log("Starts with:", url.substring(0, 50));
    }
    
  } catch (e) {
    console.error("Test Error:", e);
  }
}

test();
