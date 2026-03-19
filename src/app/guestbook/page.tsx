import { getServerSession } from "next-auth/next";
import { getGuestbooks } from "@/app/actions/guestbook";
import GuestbookClient from "@/components/GuestbookClient";
import Link from "next/link";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function GuestbookPage() {
  const session = await getServerSession();

  if (!session || !session.user) {
    redirect("/");
  }

  const entries = await getGuestbooks();

  return (
    <main>
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingTop: '1rem', paddingLeft: '2rem' }}>
        <Link href="/" style={{ color: '#0070f3', textDecoration: 'none', fontWeight: 'bold' }}>
          &larr; 메인으로 돌아가기
        </Link>
      </div>
      <GuestbookClient entries={entries} user={session.user} />
    </main>
  );
}
