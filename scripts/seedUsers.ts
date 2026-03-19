import { db } from "../src/db";
import { users } from "../src/db/schema";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

async function seed() {
  console.log("Seeding user...");
  try {
    await db.insert(users).values({
      email: "kts123@kookmin.ac.kr"
    });
    console.log("Successfully seeded kts123@kookmin.ac.kr");
  } catch (e: any) {
    if (e.message.includes("UNIQUE constraint failed")) {
      console.log("User already exists!");
    } else {
      console.error(e);
    }
  }
}

seed();
