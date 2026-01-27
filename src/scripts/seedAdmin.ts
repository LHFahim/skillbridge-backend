import { UserRolesEnum } from "../common/enums";
import { prisma } from "../lib/prisma";

async function seedAdmin() {
  try {
    console.log("Seeding admin user...");

    const adminData = {
      name: "Admin",
      email: "admin@admin.com",
      role: UserRolesEnum.ADMIN,
      password: "admin1234",
    };

    console.log("Checking if admin user exists");

    const existingUser = await prisma.user.findUnique({
      where: {
        email: adminData.email,
      },
    });

    if (existingUser) {
      throw new Error("Admin user already exists");
    }

    const signUpAdmin = await fetch(
      "http://localhost:5000/api/auth/sign-up/email",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(adminData),
      },
    );

    if (signUpAdmin.ok) {
      console.log("Admin user has been created");
      await prisma.user.update({
        where: {
          email: adminData.email,
        },
        data: {
          emailVerified: true,
        },
      });
    }
  } catch (error) {
    console.error(error);
  }
}

seedAdmin();
