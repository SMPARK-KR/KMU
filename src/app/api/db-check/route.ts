import { db } from "@/db";
import { sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    // sqlite_master를 조회하여 현재 데이터베이스에 존재하는 모든 테이블 목록을 확인합니다.
    const tablesList = await db.run(sql`SELECT name FROM sqlite_master WHERE type='table'`);
    
    return NextResponse.json({ 
      success: true, 
      tables: tablesList
    });
  } catch (error) {
    return NextResponse.json({ 
      success: false, 
      error: error instanceof Error ? error.message : "UNKNOWN" 
    }, { status: 500 });
  }
}
