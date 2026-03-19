"use client";

import { useState } from "react";
import { addGuestbook, deleteGuestbook, editGuestbook } from "@/app/actions/guestbook";
import { useRouter } from "next/navigation";

export default function GuestbookClient({
  entries,
  user
}: {
  entries: any[];
  user: { name?: string | null; email?: string | null };
}) {
  const router = useRouter();
  const [content, setContent] = useState("");
  const [serviceUrl, setServiceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editText, setEditText] = useState("");

  const formatKoreanDate = (dateVal: any) => {
    if (!dateVal) return "시간 정보 없음";
    
    let date = new Date(dateVal);

    // 1. 만약 문자열이라서 Date 생성에 실패(Invalid Date)한 경우
    if (isNaN(date.getTime())) {
      const num = Number(dateVal);
      if (!isNaN(num)) {
        // 숫자로 변환된 경우: 2026년은 1.7 * 10^12 ms 범위입니다.
        date = new Date(num > 10000000000000 ? num : num); // smart fix
      }
    }

    // 2. Drizzle 버그로 연도가 58000년 등으로 튀겨진 경우 복구
    if (date.getFullYear() > 2100) {
      date = new Date(date.getTime() / 1000);
    }

    // 3. 여전히 오류라면 현재 시간 출력 (또는 에러 표시)
    if (isNaN(date.getTime())) {
      return "시간 오류";
    }

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    let hours = date.getHours();
    const minutes = String(date.getMinutes()).padStart(2, '0');
    
    const ampm = hours >= 12 ? '오후' : '오전';
    hours = hours % 12;
    hours = hours ? hours : 12; 
    const strHours = String(hours).padStart(2, '0');

    return `${year}-${month}-${day} ${ampm} ${strHours}:${minutes}`;
  };

  const handleDelete = async (id: number) => {
    if (!confirm("정말 삭제하시겠습니까?")) return;
    const res = await deleteGuestbook(id);
    if (res.success) router.refresh();
    else alert("삭제 실패: " + res.error);
  };

  const handleSaveEdit = async (id: number) => {
    if (!editText.trim()) return;
    const res = await editGuestbook(id, editText);
    if (res.success) {
      setEditingId(null);
      router.refresh();
    } else {
      alert("수정 실패: " + res.error);
    }
  };

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim()) return;
    setIsSubmitting(true);
    setErrorMsg("");
    
    const result = await addGuestbook({
      authorName: user.name || user.email || "사용자",
      authorEmail: user.email || "no-email",
      content,
      serviceUrl,
    });

    if (result.success) {
      setContent("");
      setServiceUrl("");
      router.refresh();
    } else {
      setErrorMsg(result.error || "Failed to submit. Please try again.");
    }
    setIsSubmitting(false);
  }

  return (
    <div className="guestbook-container" style={{ maxWidth: '800px', margin: '0 auto', padding: '2rem' }}>
      <h1 style={{ fontSize: '2rem', marginBottom: '1rem' }}>서비스 방명록</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        방문한 사이트에 대한 피드백 및 본인의 서비스 소개를 남겨보세요.
      </p>

      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>방명록 작성하기</h2>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>작성자</label>
            <input 
              type="text" 
              value={`${user.name} (${user.email})`} 
              disabled 
              style={{ padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', width: '100%', backgroundColor: '#f9f9f9', color: '#666' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>내용 (피드백 및 서비스 소개) *</label>
            <textarea
              required
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="피드백 및 서비스 소개를 자유롭게 적어주세요."
              style={{ width: '100%', height: '120px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>본인 서비스 URL (선택)</label>
            <input
              type="url"
              value={serviceUrl}
              onChange={(e) => setServiceUrl(e.target.value)}
              placeholder="https://example.com"
              style={{ width: '100%', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd' }}
            />
          </div>
          <button 
            type="submit" 
            disabled={isSubmitting}
            style={{ 
              padding: '0.75rem', 
              borderRadius: '4px', 
              backgroundColor: isSubmitting ? '#999' : '#0070f3', 
              color: '#fff', 
              border: 'none',
              cursor: isSubmitting ? 'not-allowed' : 'pointer',
              fontWeight: 'bold',
              marginTop: '0.5rem'
            }}
          >
            {isSubmitting ? "등록 중..." : "방명록 등록"}
          </button>

          {errorMsg && (
            <div style={{ 
              color: '#d32f2f', 
              marginTop: '1rem', 
              padding: '1rem', 
              border: '1px solid #ffccc7', 
              borderRadius: '4px', 
              backgroundColor: '#fff2f0', 
              maxHeight: '200px', 
              overflowY: 'auto', 
              fontSize: '0.875rem',
              wordBreak: 'break-all'
            }}>
              <strong style={{ display: 'block', marginBottom: '0.5rem' }}>🚨 [시스템 에러 상세 분석]</strong>
              <p style={{ whiteSpace: 'pre-wrap', margin: 0, fontFamily: 'monospace' }}>{errorMsg}</p>
            </div>
          )}
        </form>
      </div>

      <div className="guestbook-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>방명록 목록</h2>
        {entries.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>아직 등록된 방명록이 없습니다.</p>
        ) : (
          entries.map((entry) => (
            <div key={entry.id} className="glass-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', borderBottom: '1px solid #eaeaea', paddingBottom: '0.5rem' }}>
                <strong style={{ fontSize: '1.1rem' }}>{entry.authorName}</strong>
                <span style={{ fontSize: '0.875rem', color: '#666' }}>
                  {formatKoreanDate(entry.createdAt)}
                </span>
              </div>
              
              {editingId === entry.id ? (
                <textarea 
                  value={editText} 
                  onChange={(e) => setEditText(e.target.value)} 
                  style={{ width: '100%', height: '80px', padding: '0.75rem', borderRadius: '4px', border: '1px solid #ddd', resize: 'vertical' }} 
                />
              ) : (
                <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', marginBottom: '1rem' }}>{entry.content}</p>
              )}

              {entry.serviceUrl && (
                <div style={{ backgroundColor: '#f0f7ff', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem', marginBottom: '1rem' }}>
                  <span style={{ fontWeight: 'bold' }}>서비스 링크: </span>
                  <a href={entry.serviceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
                    {entry.serviceUrl}
                  </a>
                </div>
              )}

              {entry.authorEmail === user.email && (
                <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                  {editingId === entry.id ? (
                    <>
                      <button onClick={() => handleSaveEdit(entry.id)} style={{ padding: '4px 10px', background: '#28a745', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>저장</button>
                      <button onClick={() => setEditingId(null)} style={{ padding: '4px 10px', background: '#e0e0e0', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>취소</button>
                    </>
                  ) : (
                    <>
                      <button onClick={() => { setEditingId(entry.id); setEditText(entry.content); }} style={{ padding: '4px 10px', background: '#21262d', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>수정</button>
                      <button onClick={() => handleDelete(entry.id)} style={{ padding: '4px 10px', background: '#d32f2f', color: '#fff', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.85rem' }}>삭제</button>
                    </>
                  )}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
