import { getServerSession } from "next-auth/next";
import { signIn } from "next-auth/react";
import Dashboard from "@/components/Dashboard";
import { fetchAirQualityData } from "@/lib/airkorea";
import Link from "next/link";
import "./globals.css";

export default async function Home() {
  const session = await getServerSession();

  if (!session) {
    return (
      <div className="login-container">
        <div className="glass-card" style={{ textAlign: 'center', maxWidth: '400px' }}>
          <h1 style={{ marginBottom: '16px' }}>국가 데이터 포털</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '32px' }}>
            보안된 환경에서 국가 환경 인사이트에 접속하세요.
          </p>
          <LoginButton />
        </div>
      </div>
    );
  }

  const data = await fetchAirQualityData();

  return (
    <main>
      <div style={{ padding: '1rem 2rem', display: 'flex', justifyContent: 'flex-end', gap: '1rem', alignItems: 'center' }}>
        <span style={{ fontSize: '0.875rem', color: '#666' }}>
          환영합니다, {session.user?.name}님
        </span>
        {/* Replaced <a> tag with Link components */}
        <Link 
          href="/guestbook" 
          style={{ padding: '0.75rem 1.5rem', background: '#0070f3', color: 'white', borderRadius: '4px', textDecoration: 'none', fontWeight: 'bold' }}
        >
          방명록 가기
        </Link>
      </div>
      <Dashboard data={data as any} />
    </main>
  );
}

// Client component wrapper for the login button
import { LoginBtn } from "./LoginBtn";

function LoginButton() {
  return <LoginBtn />;
}
