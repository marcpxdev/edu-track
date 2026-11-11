import { prisma } from "../../config/prisma";
import { logger } from "../../config/logger";

export async function getSchoolProfile(schoolId: string) {
  // NOTE: This service layer does NOT enforce tenant isolation.
  // That's the responsibility of the middleware (tenantIsolation).
  // This test demonstrates that we need middleware-based tenant isolation.
  const school = await prisma.school.findUnique({
    where: { id: schoolId },
    include: {
      _count: { select: { users: true, students: true, teachers: true, sections: true } },
    },
  });
  if (!school) {
    const err: any = new Error("SCHOOL_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  return school;
}

export async function updateSchoolProfile(schoolId: string, input: { name?: string; address?: string; contactEmail?: string; contactPhone?: string; logoUrl?: string }) {
  const school = await prisma.school.update({
    where: { id: schoolId },
    data: input,
  });
  logger.info({ schoolId }, "School profile updated");
  return school;
}

export async function getSchoolUsers(schoolId: string) {
  const memberships = await prisma.userSchoolMembership.findMany({
    where: { schoolId, isActive: true },
    include: { user: { select: { id: true, email: true, firstName: true, lastName: true, isActive: true, createdAt: true } } },
    orderBy: { createdAt: "desc" },
  });
  return memberships.map((m) => ({ ...m.user, role: m.role, membershipId: m.id }));
}

export async function deactivateUser(schoolId: string, userId: string) {
  const membership = await prisma.userSchoolMembership.findFirst({
    where: { schoolId, userId, isActive: true },
  });
  if (!membership) {
    const err: any = new Error("MEMBERSHIP_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  await prisma.userSchoolMembership.update({
    where: { id: membership.id },
    data: { isActive: false },
  });
  logger.info({ schoolId, userId }, "User deactivated");
  return { success: true };
}
