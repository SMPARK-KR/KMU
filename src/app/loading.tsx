"use client";

export default function Loading() {
  return (
    <div className="login-container" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div className="spinner" style={{ 
        width: '48px', 
        height: '48px', 
        border: '4px solid rgba(88, 166, 255, 0.2)', 
        borderTop: '4px solid #58a6ff', 
        borderRadius: '50%', 
        animation: 'spin 1s linear infinite' 
      }}></div>
      <p style={{ color: 'var(--text-secondary)', fontSize: '18px' }}>데이터를 안전하게 불러오고 있습니다...</p>
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
