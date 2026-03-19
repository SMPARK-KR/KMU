"use client";

import { useState } from "react";
import { addGuestbook } from "@/app/actions/guestbook";

export default function GuestbookClient({
  entries,
  user
}: {
  entries: any[];
  user: { name?: string | null; email?: string | null };
}) {
  const [content, setContent] = useState("");
  const [serviceUrl, setServiceUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !user.name || !user.email) return;

    setIsSubmitting(true);
    const result = await addGuestbook({
      authorName: user.name,
      authorEmail: user.email,
      content,
      serviceUrl,
    });

    if (result.success) {
      setContent("");
      setServiceUrl("");
    } else {
      alert("Failed to submit. Please try again.");
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
                  {new Date(entry.createdAt).toLocaleDateString()}
                </span>
              </div>
              <p style={{ whiteSpace: 'pre-wrap', lineHeight: '1.5', marginBottom: '1rem' }}>{entry.content}</p>
              {entry.serviceUrl && (
                <div style={{ backgroundColor: '#f0f7ff', padding: '0.75rem', borderRadius: '4px', fontSize: '0.875rem' }}>
                  <span style={{ fontWeight: 'bold' }}>서비스 링크: </span>
                  <a href={entry.serviceUrl} target="_blank" rel="noopener noreferrer" style={{ color: '#0070f3', textDecoration: 'none' }}>
                    {entry.serviceUrl}
                  </a>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
