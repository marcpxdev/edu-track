import { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";

export interface AuthContext {
  userId: string;
  email: string;
  schoolId: string;
  role: string;
}

/**
 * Authentication middleware (cookie-based session).
 * Resolves the user's session, then their membership role within the school.
 * Attaches req.auth and req.schoolId for downstream middleware/handlers.
 *
 * Note: school membership is resolved here against a specific school context.
 * For endpoints that don't yet know the school (e.g. school profile lookup),
 * see the optional variant resolveAuthWithoutSchool.
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const token = req.cookies?.session_token;
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
    prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    // Resolve the user's membership for the school in context.
    // The schoolId may come from a header/param for multi-school users;
    // tenantIsolation middleware will re-derive and enforce it.
    const schoolId = (req as any).schoolId || req.query.schoolId || req.body.schoolId;

    let membershipRole = "TEACHER";
    if (schoolId) {
      const membership = await prisma.userSchoolMembership.findFirst({
        where: { userId: session.user.id, schoolId, isActive: true },
      });
      if (membership) membershipRole = membership.role;
    }

    (req as Request & { auth?: AuthContext }).auth = {
      userId: session.user.id,
      email: session.user.email,
      schoolId: schoolId || "",
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
    const token = req.cookies?.session_token;
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
    prisma.session.update({
      where: { id: session.id },
      data: { lastUsedAt: new Date() },
    }).catch(() => {});

    const schoolId = (req as any).schoolId || req.query.schoolId || req.body.schoolId;

    let membershipRole = "TEACHER";
    if (schoolId) {
      const membership = await prisma.userSchoolMembership.findFirst({
        where: { userId: session.user.id, schoolId, isActive: true },
      });
      if (membership) membershipRole = membership.role;
    }

    (req as Request & { auth?: AuthContext }).auth = {
      userId: session.user.id,
      email: session.user.email,
      schoolId: schoolId || "",
      role: membershipRole,
    };

    next();
  } catch {
    next();
  }
};
