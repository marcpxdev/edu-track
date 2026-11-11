import type { Request, Response, NextFunction } from "express";

/**
 * Role-based access control middleware.
 * Allowed roles are checked against the user's membership role for the school.
 */
export const requireRole = (...allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const auth = (req as Request & { auth?: { role: string } }).auth;
    if (!auth) {
      res.status(401).json({ success: false, error: { code: "UNAUTHENTICATED", message: "Authentication required" } });
      return;
    }

    if (!allowedRoles.includes(auth.role)) {
      res.status(403).json({
        success: false,
        error: { code: "FORBIDDEN", message: "Insufficient role for this action" },
      });
      return;
    }

    next();
  };
};

export const requireSchoolAdmin = requireRole("SCHOOL_ADMIN", "PLATFORM_ADMIN");
export const requireTeacher = requireRole("SCHOOL_ADMIN", "TEACHER", "PLATFORM_ADMIN");
export const requireAnyAuthenticated = requireRole("SCHOOL_ADMIN", "TEACHER", "STUDENT", "PARENT", "PLATFORM_ADMIN");
