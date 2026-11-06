import { prisma } from "../../config/prisma";
import { logger } from "../../config/logger";
import { env } from "../../config/env";
import argon2 from "argon2";

/**
 * Auth service — MVP 1: registration, login, session management, password reset.
 * All mutations are scoped to a single school (tenant isolation).
 */

export async function register(input: {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  schoolName: string;
}) {
  const existingUser = await prisma.user.findUnique({ where: { email: input.email } });
  if (existingUser) {
    const err: any = new Error("EMAIL_ALREADY_EXISTS");
    err.statusCode = 409;
    throw err;
  }

  const passwordHash = await argon2.hash(input.password);

  const result = await prisma.$transaction(async (tx) => {
    const user = await tx.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
      },
    });

    const school = await tx.school.create({
      data: { name: input.schoolName, isActive: true },
    });

    await tx.userSchoolMembership.create({
      data: { userId: user.id, schoolId: school.id, role: "SCHOOL_ADMIN", isActive: true },
    });

    return { user, school };
  });

  logger.info({ userId: result.user.id, schoolId: result.school.id }, "User registered");
  return result;
}

export async function login(input: { email: string; password: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user) {
    const err: any = new Error("INVALID_CREDENTIALS");
    err.statusCode = 401;
    throw err;
  }

  const valid = await argon2.verify(user.passwordHash, input.password);
  if (!valid) {
    const err: any = new Error("INVALID_CREDENTIALS");
    err.statusCode = 401;
    throw err;
  }

  if (!user.isActive) {
    const err: any = new Error("USER_INACTIVE");
    err.statusCode = 401;
    throw err;
  }

  // Create session
  const crypto = require("crypto");
  const token = crypto.randomBytes(32).toString("hex");
  const tokenHash = token; // In production, hash the token before storing
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  const session = await prisma.session.create({
    data: { userId: user.id, tokenHash, expiresAt },
  });

  return { user, session, token };
}

export async function logout(tokenHash: string) {
  await prisma.session.deleteMany({ where: { tokenHash } });
}

export async function requestPasswordReset(input: { email: string }) {
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  // Always succeed (don't leak whether email exists)
  if (!user) return { sent: true };

  const crypto = require("crypto");
  const resetToken = crypto.randomBytes(32).toString("hex");
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

  await prisma.session.create({
    data: { userId: user.id, tokenHash: resetToken, expiresAt },
  });

  // In production: send email with reset link containing resetToken
  logger.info({ userId: user.id }, "Password reset requested");
  return { sent: true };
}

export async function confirmPasswordReset(input: { token: string; newPassword: string }) {
  const session = await prisma.session.findUnique({
    where: { tokenHash: input.token },
    include: { user: true },
  });

  if (!session || session.expiresAt < new Date()) {
    const err: any = new Error("INVALID_OR_EXPIRED_TOKEN");
    err.statusCode = 400;
    throw err;
  }

  const passwordHash = await argon2.hash(input.newPassword);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: session.userId },
      data: { passwordHash },
    }),
    prisma.session.delete({ where: { id: session.id } }),
  ]);

  logger.info({ userId: session.userId }, "Password reset confirmed");
  return { success: true };
}

export async function getSessionUser(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, isActive: true, createdAt: true },
  });
  if (!user) {
    const err: any = new Error("USER_NOT_FOUND");
    err.statusCode = 404;
    throw err;
  }
  return user;
}
