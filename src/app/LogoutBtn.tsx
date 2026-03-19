"use client";

import { signOut } from "next-auth/react";

export function LogoutBtn() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: '/' })}
      style={{
        padding: '0.75rem 1.5rem',
        background: '#ff4d4f',
        color: 'white',
        borderRadius: '4px',
        border: 'none',
        cursor: 'pointer',
        fontWeight: 'bold',
        transition: 'background 0.2s'
      }}
      onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#ff7875'}
      onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#ff4d4f'}
    >
      로그아웃
    </button>
  );
}
