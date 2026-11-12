import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export interface AuthContext {
  userId: string;
  email: string;
  schoolId: string;
  role: string;
}

/**
 * Extracts an optional schoolId hint from the request without trusting it.
 * Auth middleware uses this only to resolve which school role to attach;
 * tenantIsolation middleware will re-derive and enforce the authorized school.
 */
function getSchoolIdHint(req: Request): string | undefined {
  if (typeof req.query.schoolId === "string") return req.query.schoolId;
  if (
    typeof req.body === "object" &&
    req.body !== null &&
    typeof (req.body as Record<string, unknown>).schoolId === "string"
  ) {
    return (req.body as Record<string, unknown>).schoolId as string;
  }
  return undefined;
}

/**
 * Authentication middleware (cookie-based session).
 * Resolves the user's session, then their membership role within the school.
 * Attaches req.auth for downstream middleware/handlers.
 *
 * Note: school membership is resolved here against a specific school context.
 * For endpoints that don't yet know the school (e.g. school profile lookup),
 * see the optional variant optionalAuth.
 */
function getSessionToken(req: Request): string | undefined {
  const rawCookies = req.cookies as Record<string, unknown> | undefined;
  return typeof rawCookies?.session_token === "string" ? rawCookies.session_token : undefined;
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getSessionToken(req);
    if (!token) {
      res.status(401).json({
        success: false,
        error: { code: "UNAUTHENTICATED", message: "No session token" },
      });
      return;
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      res.status(401).json({
        success: false,
        error: { code: "SESSION_EXPIRED", message: "Session expired or invalid" },
      });
      return;
    }

    if (!session.user.isActive) {
      res.status(401).json({
        success: false,
        error: { code: "USER_INACTIVE", message: "User account is deactivated" },
      });
      return;
    }

    // Update lastUsedAt (non-blocking)
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    // Resolve the user's membership for the school in context.
    // The schoolId may come from query/body for multi-school users;
    // tenantIsolation middleware will re-derive and enforce it.
    const schoolId = getSchoolIdHint(req);

    let membershipRole = "TEACHER";
    if (schoolId) {
      const membership = await prisma.userSchoolMembership.findFirst({
        where: { userId: session.user.id, schoolId, isActive: true },
      });
      if (membership) membershipRole = membership.role;
    }

    req.auth = {
      userId: session.user.id,
      email: session.user.email,
      schoolId: schoolId ?? "",
      role: membershipRole,
    };

    next();
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { code: "AUTH_ERROR", message: "Authentication failed" },
    });
  }
};

export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = getSessionToken(req);
    if (!token) {
      next();
      return;
    }

    const session = await prisma.session.findUnique({
      where: { tokenHash: token },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date() || !session.user.isActive) {
      next();
      return;
    }

    // Update lastUsedAt (non-blocking)
    await prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    const schoolId = getSchoolIdHint(req);

    let membershipRole = "TEACHER";
    if (schoolId) {
      const membership = await prisma.userSchoolMembership.findFirst({
        where: { userId: session.user.id, schoolId, isActive: true },
      });
      if (membership) membershipRole = membership.role;
    }

    req.auth = {
      userId: session.user.id,
      email: session.user.email,
      schoolId: schoolId ?? "",
      role: membershipRole,
    };

    next();
  } catch {
    next();
  }
};
