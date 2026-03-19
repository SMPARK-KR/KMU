"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";

export default function YouTubeVisionPage() {
  const [url, setUrl] = useState("");
  const [cookie, setCookie] = useState(""); // 우회용 쿠키 추가
  const [videoSrc, setVideoSrc] = useState<string | null>(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  
  const [modelStatus, setModelStatus] = useState("모델을 자동 로드 중입니다...");
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [modelError, setModelError] = useState<string | null>(null);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState("");

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    loadModel();
  }, []);

  // Load the model
  const loadModel = async () => {
    try {
      setModelError(null);
      setModelStatus("Qwen-VL 프로세서 및 가속기 초기화 중...");
      const { AutoProcessor, Qwen2VLForConditionalGeneration, env } = await import("@huggingface/transformers");
      env.allowLocalModels = false;
      
      if ((navigator as any).gpu) {
        // @ts-ignore
        if (!env.backends.onnx) env.backends.onnx = {};
        // @ts-ignore
        if (!env.backends.onnx.wasm) env.backends.onnx.wasm = {};
        // @ts-ignore
        env.backends.onnx.wasm.wasmPaths = '/wasm/';
      }
      
      const model_id = "onnx-community/Qwen2-VL-2B-Instruct";

      if (!(window as any).visionProcessor) {
        (window as any).visionProcessor = await AutoProcessor.from_pretrained(model_id);
      }

      if (!(window as any).visionModel) {
        (window as any).visionModel = await Qwen2VLForConditionalGeneration.from_pretrained(model_id, {
          device: (navigator as any).gpu ? "webgpu" : "wasm",
          progress_callback: (d: any) => {
            if (d.status === "progress") {
              setDownloadProgress(Math.round(d.progress));
              setModelStatus(`Qwen-VL 모델 다운로드 중... ${Math.round(d.progress)}%`);
            }
          }
        });
      }
      
      setIsModelLoaded(true);
      setModelStatus("Qwen-VL 로드 완료 (WebGPU 가속)");
    } catch (e: any) {
      console.error(e);
      setModelError(e.message);
      setModelStatus("로드 실패");
    }
  };

  const handleLoadYouTube = async () => {
    if (!url) return;
    setLoadingVideo(true);
    setVideoSrc(null);
    try {
      // 정규식으로 Video ID 추출 (Shorts 포함)
      const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
      const match = url.match(regExp);
      const videoId = (match && match[2].length === 11) ? match[2] : null;

      if (!videoId) {
        throw new Error("올바른 YouTube 주소가 아닙니다.");
      }

      setVideoSrc(`https://www.youtube.com/embed/${videoId}?autoplay=1&enablejsapi=1`);
    } catch (e: any) {
      alert(`[에러] ${e.message}`);
    } finally {
      setLoadingVideo(false);
    }
  };

  const captureAndAnalyze = async () => {
    if (!isModelLoaded) return;
    setIsAnalyzing(true);
    setResult("정지 화면을 캡쳐 중입니다. 브라우저 팝업에서 [이 탭 전체] 혹은 [해당 화면]을 선택해 주세요! (CORS 보안 한계로 인한 필수 조치입니다)");
    
    try {
      const stream = await navigator.mediaDevices.getDisplayMedia({
        video: { displaySurface: "browser" },
        // @ts-ignore
        audio: false
      });

      const tempVideo = document.createElement("video");
      tempVideo.srcObject = stream;
      await tempVideo.play();

      const canvas = canvasRef.current;
      if (!canvas) throw new Error("캔버스 로드 실패");

      canvas.width = tempVideo.videoWidth;
      canvas.height = tempVideo.videoHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("컨텍스트 로드 실패");

      ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
      stream.getTracks().forEach(track => track.stop());

      setResult("화면 캡쳐 완료! Qwen-VL 모델 분석을 시작합니다...");

      const { RawImage } = await import("@huggingface/transformers");
      const imageUrl = canvas.toDataURL("image/jpeg");
      const image = await RawImage.fromURL(imageUrl);

      const processor = (window as any).visionProcessor;
      const model = (window as any).visionModel;

      const conversation = [
        {
          role: "user",
          content: [
            { type: "image" },
            { type: "text", text: "이 사진을 분석해서 무엇을 하고 있는 장면인지 한국어(Korean)로 상세하게 설명해줘." }
          ]
        }
      ];

      const text = processor.apply_chat_template(conversation, { tokenize: false, add_generation_prompt: true });
      const inputs = await processor(text, image);

      const output = await model.generate({
        ...inputs,
        max_new_tokens: 256,
      });

      const decoded = processor.batch_decode(output, { skip_special_tokens: true });
      
      let responseText = decoded[0] || "분석 실패";
      if (responseText.includes("설명해줘.")) {
         responseText = responseText.split("설명해줘.")[1]?.trim() || responseText;
      }

      setResult(`[분석 결과]:\n${responseText}\n\n💡 (Qwen-VL 2.2B 모델 구동 중)`);
    } catch (e: any) {
      setResult("분석 에러: " + e.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <main style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem' }}>
      <div style={{ marginBottom: '2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none', color: '#0070f3', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }}>
          ← 대기질 대시보드로 돌아가기
        </Link>
      </div>

      <h1 style={{ fontSize: '2rem', fontWeight: 'bold', marginBottom: '1rem' }}>📺 유튜브 정지 화면 AI 분석 (WebGPU)</h1>
      <p style={{ marginBottom: '1rem', color: '#666' }}>WebGPU를 지원하는 최신 경량 모델을 기반으로 시각 자료를 실시간으로 해석합니다.</p>

      {/* 실시간 모델 상태 배너 추가 (배경 로딩 방식) */}
      <div style={{ 
        padding: '12px 20px', 
        background: isModelLoaded ? '#e6ffec' : (modelError ? '#ffebe9' : '#fff9db'), 
        borderRadius: '8px', 
        marginBottom: '25px', 
        border: '1px solid', 
        borderColor: isModelLoaded ? '#3fb950' : (modelError ? '#ff8182' : '#d4a72c'), 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center' 
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '15px', fontWeight: 'bold', color: isModelLoaded ? '#1a7f37' : (modelError ? '#cf222e' : '#9a6700') }}>
            🤖 AI 가속기: {modelStatus}
          </span>
          {modelError && (
             <button onClick={loadModel} style={{ padding: '3px 8px', fontSize: '11px', background: '#cf222e', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>재시도</button>
          )}
        </div>
        {!isModelLoaded && !modelError && (
           <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{ width: '150px', height: '10px', background: 'rgba(0,0,0,0.1)', borderRadius: '5px', overflow: 'hidden' }}>
                 <div style={{ width: `${downloadProgress}%`, height: '100%', background: '#0070f3', transition: 'width 0.3s' }} />
              </div>
              <span style={{ fontSize: '13px', color: '#9a6700' }}>{downloadProgress}%</span>
           </div>
        )}
      </div>

      <div style={{ marginBottom: '2rem', padding: '1.5rem', border: '1px solid #e1e4e8', borderRadius: '8px', background: '#fff' }}>
        <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>1. 유튜브 영상 로드</h2>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input 
            type="text" 
            placeholder="유튜브 URL을 입력하세요 (예: https://www.youtube.com/watch?v=...)" 
            value={url}
            onChange={e => setUrl(e.target.value)}
            style={{ flex: 1, padding: '0.75rem', borderRadius: '4px', border: '1px solid #ccc' }}
          />
          <button 
            onClick={handleLoadYouTube}
            disabled={loadingVideo || !url}
            style={{ padding: '0.75rem 1.5rem', background: '#28a745', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}
          >
            {loadingVideo ? "불러오는 중..." : "영상 로드"}
          </button>
        </div>
      </div>

      {videoSrc && (
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '10px' }}>2. 영상 재생 및 분석</h2>
          <p style={{ fontSize: '0.9rem', marginBottom: '1rem', color: '#666' }}>영상을 재생하다가 분석하고 싶은 장면에서 버튼을 누르세요.</p>
          
          <iframe 
            src={videoSrc} 
            width="100%" 
            height="450px" 
            style={{ borderRadius: '8px', background: 'black', marginBottom: '1rem', border: 'none' }} 
            allow="autoplay; encrypted-media" 
            allowFullScreen 
          />
          
          <button 
            onClick={captureAndAnalyze}
            disabled={!isModelLoaded || isAnalyzing}
            style={{ width: '100%', padding: '1rem', background: isAnalyzing ? '#ccc' : '#dc3545', color: 'white', fontSize: '1.1rem', fontWeight: 'bold', borderRadius: '4px', border: 'none', cursor: isAnalyzing ? 'wait' : 'pointer' }}
          >
            {isAnalyzing ? "분석 중..." : "📸 현재 화면 캡쳐 & 분석하기"}
          </button>
        </div>
      )}

      <canvas ref={canvasRef} style={{ display: 'none' }} />

      <div style={{ padding: '1.5rem', background: '#f6f8fa', borderRadius: '8px', minHeight: '120px', border: '1px solid #e1e4e8' }}>
        <h3 style={{ fontWeight: 'bold', marginBottom: '0.5rem', color: '#24292e' }}>🧠 AI 분석 결과</h3>
        <p style={{ whiteSpace: 'pre-wrap', color: '#24292e', lineHeight: 1.5 }}>{result || "결과가 이곳에 표시됩니다."}</p>
      </div>
    </main>
  );
}
