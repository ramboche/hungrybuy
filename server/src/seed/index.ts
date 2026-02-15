import "dotenv/config";
import { prisma } from "../lib/prisma";
import { seedAdminUser } from "./admin.seed";
import { seedMenu } from "./menu.seed";

async function main() {
  await seedAdminUser();
  await seedMenu();
}

main()
  .catch((error) => {
    console.log("seeding failed", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
