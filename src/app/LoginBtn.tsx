"use client";

import { signIn } from "next-auth/react";

export function LoginBtn() {
  return (
    <button className="login-btn" onClick={() => signIn('google')}>
      <img src="https://authjs.dev/img/providers/google.svg" alt="Google" width="20" height="20" />
      Sign in with Google
    </button>
  );
}
