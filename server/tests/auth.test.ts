import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { prisma } from "./setup";

describe("Auth module (database)", () => {
  beforeAll(async () => {
    // Ensure clean state
    await prisma.session.deleteMany();
    await prisma.userSchoolMembership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();
  });

  afterAll(async () => {
    await prisma.session.deleteMany();
    await prisma.userSchoolMembership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();
    await prisma.$disconnect();
  });

  it("creates a user, school, and membership in a transaction", async () => {
    const school = await prisma.school.create({
      data: { name: "Test School", isActive: true },
    });
    expect(school.id).toBeDefined();

    const user = await prisma.user.create({
      data: {
        email: "admin@testschool.edu",
        passwordHash: "hashed-password",
        firstName: "Test",
        lastName: "Admin",
        isActive: true,
      },
    });
    expect(user.id).toBeDefined();

    const membership = await prisma.userSchoolMembership.create({
      data: {
        userId: user.id,
        schoolId: school.id,
        role: "SCHOOL_ADMIN",
        isActive: true,
      },
    });
    expect(membership.role).toBe("SCHOOL_ADMIN");
    expect(membership.schoolId).toBe(school.id);
  });

  it("enforces unique user-school membership", async () => {
    const school = await prisma.school.create({
      data: { name: "Unique Test School", isActive: true },
    });
    const user = await prisma.user.create({
      data: {
        email: "unique@test.edu",
        passwordHash: "hash",
        firstName: "U",
        lastName: "User",
        isActive: true,
      },
    });

    await prisma.userSchoolMembership.create({
      data: { userId: user.id, schoolId: school.id, role: "TEACHER", isActive: true },
    });

    await expect(
      prisma.userSchoolMembership.create({
        data: { userId: user.id, schoolId: school.id, role: "TEACHER", isActive: true },
      })
    ).rejects.toThrow();
  });
});
