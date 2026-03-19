"use server";

import { db } from "@/db";
import { guestbook } from "@/db/schema";
import { desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGuestbooks() {
  try {
    const entries = await db
      .select()
      .from(guestbook)
      .orderBy(desc(guestbook.createdAt));
      
    console.log("📋 DB [createdAt] TYPES DIAGNOSTIC:", entries.slice(0,3).map(e => ({
      id: e.id,
      createdAt: e.createdAt,
      type: typeof e.createdAt,
      isDate: e.createdAt instanceof Date
    })));

    return entries;
  } catch (error) {
    console.error("Failed to fetch guestbook:", error);
    return [];
  }
}

export async function addGuestbook(data: {
  authorName: string;
  authorEmail: string;
  content: string;
  serviceUrl?: string;
}) {
  try {
    const timestamp = Date.now();
    const finalContent = data.serviceUrl 
      ? `${data.content}\n\n[링크] ${data.serviceUrl}` 
      : data.content;

    const baseUrl = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!baseUrl || !token) {
      throw new Error("환경 변수 (TURSO_DATABASE_URL, TURSO_AUTH_TOKEN)가 설정되지 않았습니다.");
    }

    const httpUrl = baseUrl.replace("libsql://", "https://");

    const response = await fetch(`${httpUrl}/v2/pipeline`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        requests: [
          {
            type: "execute",
            stmt: {
              sql: "INSERT INTO guestbook (author_name, author_email, content, created_at) VALUES (?, ?, ?, ?)",
              args: [
                { type: "text", value: data.authorName },
                { type: "text", value: data.authorEmail },
                { type: "text", value: finalContent },
                { type: "integer", value: timestamp.toString() }
              ]
            }
          },
          { type: "close" }
        ]
      }),
      cache: "no-store",
      next: { revalidate: 0 }
    });

    const respText = await response.text();
    console.log("Turso HTTP Response:", respText);

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${respText}`);
    }

    const resJson = JSON.parse(respText);
    if (resJson.results && resJson.results[0] && resJson.results[0].type === "error") {
      throw new Error(`DB Error: ${JSON.stringify(resJson.results[0].error)}`);
    }

    revalidatePath("/guestbook");
    return { success: true };

  } catch (error) {
    console.error("Failed to add guestbook entry via HTTP:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Unknown HTTP pipeline error" 
    };
  }
}

export async function deleteGuestbook(id: number) {
  try {
    const baseUrl = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!baseUrl || !token) throw new Error("환경 변수 누락");
    const httpUrl = baseUrl.replace("libsql://", "https://");

    const response = await fetch(`${httpUrl}/v2/pipeline`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            type: "execute",
            stmt: {
              sql: "DELETE FROM guestbook WHERE id = ?",
              args: [{ type: "integer", value: id.toString() }]
            }
          },
          { type: "close" }
        ]
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    revalidatePath("/guestbook");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function editGuestbook(id: number, content: string) {
  try {
    const baseUrl = process.env.TURSO_DATABASE_URL;
    const token = process.env.TURSO_AUTH_TOKEN;

    if (!baseUrl || !token) throw new Error("환경 변수 누락");
    const httpUrl = baseUrl.replace("libsql://", "https://");

    const response = await fetch(`${httpUrl}/v2/pipeline`, {
      method: "POST",
      headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        requests: [
          {
            type: "execute",
            stmt: {
              sql: "UPDATE guestbook SET content = ? WHERE id = ?",
              args: [
                { type: "text", value: content },
                { type: "integer", value: id.toString() }
              ]
            }
          },
          { type: "close" }
        ]
      })
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    revalidatePath("/guestbook");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
