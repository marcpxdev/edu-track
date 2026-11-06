import { Request, Response } from "express";
import * as authService from "./service";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../middleware/error";
import { registerSchema, loginSchema, passwordResetRequestSchema, passwordResetConfirmSchema } from "./schema";

export const register = asyncHandler(async (req: Request, res: Response) => {
  const input = registerSchema.parse(req.body);
  const result = await authService.register(input);
  sendSuccess(res, { user: { id: result.user.id, email: result.user.email }, school: { id: result.school.id, name: result.school.name } }, 201);
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const input = loginSchema.parse(req.body);
  const { user, session, token } = await authService.login(input);

  // Set HttpOnly secure cookie
  res.cookie("session_token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 7 * 24 * 60 * 60 * 1000,
    path: "/",
  });

  sendSuccess(res, {
    user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    sessionId: session.id,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.cookies?.session_token;
  if (token) await authService.logout(token);
  res.clearCookie("session_token", { path: "/" });
  sendSuccess(res, { message: "Logged out" });
});

export const requestPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const input = passwordResetRequestSchema.parse(req.body);
  await authService.requestPasswordReset(input);
  sendSuccess(res, { message: "If an account exists, a reset link has been sent" });
});

export const confirmPasswordReset = asyncHandler(async (req: Request, res: Response) => {
  const input = passwordResetConfirmSchema.parse(req.body);
  await authService.confirmPasswordReset(input);
  sendSuccess(res, { message: "Password has been reset" });
});

export const me = asyncHandler(async (req: Request, res: Response) => {
  const auth = (req as Request & { auth?: { userId: string } }).auth;
  if (!auth) {
    sendError(res, "UNAUTHENTICATED", "Authentication required", 401);
    return;
  }
  const user = await authService.getSessionUser(auth.userId);
  sendSuccess(res, { user });
});
