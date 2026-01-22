import "dotenv/config";
import { prisma } from "../lib/prisma";
import { seedAdminUser } from "./admin.seed";

async function main() {
  await seedAdminUser();
}

main()
  .catch((err) => {
    console.log("seeding failed");
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
