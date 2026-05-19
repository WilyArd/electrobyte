import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";

async function main() {
  const connectionString = process.env.DATABASE_URL;
  const pool = new Pool({ connectionString });
  const adapter = new PrismaPg(pool);

  const prisma = new PrismaClient({ adapter });
  console.log("Initialized PrismaClient 7 with adapter-pg!");
  const userCount = await prisma.user.count();
  console.log(`Users in DB: ${userCount}`);
}

main().catch(console.error);
