import { prisma } from "../lib/prisma";
import { hashPassword } from "../utils/hash";

export async function seedAdminUser() {
  try {
    const adminMail = process.env.ADMIN_MAIL;
    const adminPass = process.env.ADMIN_PASS;

    if (!adminMail || !adminPass) {
      throw new Error("ADMIN_MAIL and ADMIN_PASS must be defined");
    }

    const user = await prisma.user.findUnique({
      where: {
        email: adminMail,
      },
    });

    if (user) {
      console.log("User already exists");
      return;
    }

    const hashedPassword = await hashPassword(adminPass);

    await prisma.user.create({
      data: {
        name: "Admin",
        email: adminMail,
        password: hashedPassword,
        role: "ADMIN",
      },
    });

    console.log("admin user created successfully");
  } catch (error) {
    console.log("admin user creation failed", error);
  }
}
