"use server";

import { db } from "@/db";
import { guestbook } from "@/db/schema";
import { desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getGuestbooks() {
  try {
    const entries = await db
      .select()
      .from(guestbook)
      .orderBy(desc(guestbook.createdAt));
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
    await db.insert(guestbook).values({
      authorName: data.authorName,
      authorEmail: data.authorEmail,
      content: data.content,
      serviceUrl: data.serviceUrl || null,
    });
    
    // Refresh the guestbook page
    revalidatePath("/guestbook");
    return { success: true };
  } catch (error) {
    console.error("Failed to add guestbook entry:", error);
    return { success: false, error: "Failed to add entry" };
  }
}
