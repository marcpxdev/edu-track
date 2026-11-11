import { describe, it, expect, beforeEach, afterEach } from "vitest";
import type { Request, Response, NextFunction } from "express";
import { prisma } from "./setup";
import { register, login } from "../src/modules/auth/service";
import {
  getSchoolProfile,
  getSchoolUsers,
  updateSchoolProfile,
  deactivateUser,
} from "../src/modules/schools/service";
import { tenantIsolation } from "../src/middleware/tenant";
import { requireRole } from "../src/middleware/rbac";

function createMockRes() {
  const res: Partial<Response> & { statusCode?: number; body?: unknown } = {};
  res.status = (code: number) => {
    res.statusCode = code;
    return res as Response;
  };
  res.json = (body: unknown) => {
    res.body = body;
    return res as Response;
  };
  return res as Response & { statusCode?: number; body?: unknown };
}

describe("Tenant isolation & RBAC - Week 4 MVP 1", () => {
  let schoolA: { id: string; name: string };
  let schoolB: { id: string; name: string };
  let adminA: { id: string; email: string; schoolId: string; role: string };
  let adminB: { id: string; email: string; schoolId: string; role: string };

  beforeEach(async () => {
    await prisma.session.deleteMany();
    await prisma.userSchoolMembership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();

    const resultA = await register({
      email: "admin-a@example.com",
      password: "Password123",
      firstName: "Admin",
      lastName: "A",
      schoolName: "School A",
    });
    schoolA = { id: resultA.school.id, name: resultA.school.name };
    adminA = {
      id: resultA.user.id,
      email: resultA.user.email,
      schoolId: resultA.school.id,
      role: "SCHOOL_ADMIN",
    };

    const resultB = await register({
      email: "admin-b@example.com",
      password: "Password123",
      firstName: "Admin",
      lastName: "B",
      schoolName: "School B",
    });
    schoolB = { id: resultB.school.id, name: resultB.school.name };
    adminB = {
      id: resultB.user.id,
      email: resultB.user.email,
      schoolId: resultB.school.id,
      role: "SCHOOL_ADMIN",
    };
  });

  afterEach(async () => {
    await prisma.session.deleteMany();
    await prisma.userSchoolMembership.deleteMany();
    await prisma.user.deleteMany();
    await prisma.school.deleteMany();
  });

  it("derives school context from session membership (tenantIsolation)", async () => {
    const req = {
      auth: {
        userId: adminA.id,
        email: adminA.email,
        schoolId: adminA.schoolId,
        role: adminA.role,
      },
    } as unknown as Request;
    const res = createMockRes();
    let nextCalled = false;

    await tenantIsolation(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(true);
    expect((req as Request & { school?: { id: string } }).school?.id).toBe(adminA.schoolId);
  });

  it("rejects tenant context when membership does not match (cross-school)", async () => {
    const req = {
      auth: {
        userId: adminA.id,
        email: adminA.email,
        schoolId: adminB.schoolId, // attempt to access School B with School A user
        role: adminA.role,
      },
    } as unknown as Request;
    const res = createMockRes();
    let nextCalled = false;

    await tenantIsolation(req, res, () => {
      nextCalled = true;
    });

    expect(nextCalled).toBe(false);
    expect(res.statusCode).toBe(403);
  });

  it("RBAC allows school admin and blocks teacher on admin-only actions", () => {
    const adminReq = {
      auth: { userId: adminA.id, email: adminA.email, schoolId: adminA.schoolId, role: adminA.role },
    } as unknown as Request;
    const teacherReq = {
      auth: { userId: adminA.id, email: adminA.email, schoolId: adminA.schoolId, role: "TEACHER" },
    } as unknown as Request;

    const adminRes = createMockRes();
    const teacherRes = createMockRes();
    let adminNext = false;
    let teacherNext = false;

    requireRole("SCHOOL_ADMIN", "PLATFORM_ADMIN")(adminReq, adminRes, () => {
      adminNext = true;
    });
    requireRole("SCHOOL_ADMIN", "PLATFORM_ADMIN")(teacherReq, teacherRes, () => {
      teacherNext = true;
    });

    expect(adminNext).toBe(true);
    expect(teacherNext).toBe(false);
    expect(teacherRes.statusCode).toBe(403);
  });

  it("schools service: reads/updates only the requested (authorized) school", async () => {
    const school = await getSchoolProfile(schoolA.id);
    expect(school.id).toBe(schoolA.id);
    expect(school.name).toBe("School A");

    const updated = await updateSchoolProfile(schoolA.id, { name: "School A Updated" });
    expect(updated.id).toBe(schoolA.id);
    expect(updated.name).toBe("School A Updated");

    // School B remains unchanged (no cross-school mutation) - service layer doesn't enforce tenant isolation
    // This demonstrates why middleware is essential
    const schoolBStill = await getSchoolProfile(schoolB.id);
    expect(schoolBStill.name).toBe("School B");
  });

  it("schools service: lists and deactivates users within the same school only", async () => {
    const usersA = await getSchoolUsers(schoolA.id);
    const usersB = await getSchoolUsers(schoolB.id);

    expect(usersA).toHaveLength(1);
    expect(usersA[0].email).toBe("admin-a@example.com");
    expect(usersB).toHaveLength(1);
    expect(usersB[0].email).toBe("admin-b@example.com");

    // Cannot deactivate a user from another school (no membership in schoolA)
    await expect(deactivateUser(schoolA.id, adminB.id)).rejects.toThrow();

    // Can deactivate own school's user
    const result = await deactivateUser(schoolA.id, adminA.id);
    expect(result.success).toBe(true);

    const usersAAfter = await getSchoolUsers(schoolA.id);
    expect(usersAAfter).toHaveLength(0);

    // School B user remains active/unaffected
    const usersBAfter = await getSchoolUsers(schoolB.id);
    expect(usersBAfter).toHaveLength(1);
  });
});