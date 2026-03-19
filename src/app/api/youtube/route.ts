import { NextRequest, NextResponse } from "next/server";
import { Innertube } from "youtubei.js";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const url = req.nextUrl.searchParams.get("url");

  if (!url) {
    return NextResponse.json({ error: "Invalid YouTube URL" }, { status: 400 });
  }

  try {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    const videoId = (match && match[2].length === 11) ? match[2] : null;

    if (!videoId) {
      return NextResponse.json({ error: "올바른 유튜브 주소가 아닙니다." }, { status: 400 });
    }

    const yt = await Innertube.create();
    const info = await yt.getInfo(videoId);
    
    // 비전 분석에 적합한 오디오+비디오 통합 또는 비디오 전용 포맷 추출
    const format = info.chooseFormat({ type: 'video+audio', quality: 'best' });

    if (!format || !format.url) {
      return NextResponse.json({ error: "지원하는 크기의 비디오 포맷을 찾을 수 없습니다." }, { status: 404 });
    }

    return NextResponse.json({
      title: info.basic_info.title || "YouTube Video",
      videoUrl: format.url,
      thumbnail: info.basic_info.thumbnail?.[0]?.url || "",
    });
  } catch (error: any) {
    console.error("YouTube parse error:", error);
    return NextResponse.json({ error: `영상을 불러오지 못했습니다: ${error.message}` }, { status: 500 });
  }
}
