import type { Request, Response, NextFunction } from "express";
import { prisma } from "../config/prisma";
import { logger } from "../config/logger";

/**
 * Authenticated user context, attached to req by the auth middleware.
 */
export interface AuthContext {
  userId: string;
  email: string;
  schoolId: string;
  role: string;
}

/**
 * Tenant isolation middleware.
 *
 * Derives the authorized schoolId from the authenticated session + membership,
 * and attaches it to req.school. Never trusts a schoolId supplied by the client.
 */
export const tenantIsolation = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const auth = (req as Request & { auth?: AuthContext }).auth;
    if (!auth) {
      res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      return;
    }

    // Derive school from session + membership (never from client input)
    const membership = await prisma.userSchoolMembership.findFirst({
      where: { userId: auth.userId, schoolId: auth.schoolId, isActive: true },
      include: { school: true },
    });

    if (!membership) {
      res.status(403).json({
        success: false,
        error: { code: "NO_MEMBERSHIP", message: "No active membership for this school" },
      });
      return;
    }

    (req as Request & { school?: { id: string; name: string } }).school = {
      id: membership.school.id,
      name: membership.school.name,
    };

    next();
  } catch (error) {
    logger.error(error, "Tenant isolation middleware error");
    res.status(500).json({ success: false, error: { code: "INTERNAL_ERROR", message: "Tenant resolution failed" } });
  }
};

/**
 * Helper: extract the authorized schoolId from the request.
 * Safe to call after tenantIsolation has run.
 */
export const getSchoolId = (req: Request): string | undefined => {
  return (req as Request & { school?: { id: string } }).school?.id;
};
