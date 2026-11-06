import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import * as controller from "./controller";
import { validate } from "../../middleware/validation";
import {
  registerSchema,
  loginSchema,
  passwordResetRequestSchema,
  passwordResetConfirmSchema,
} from "./schema";

const router = Router();

// Public routes
router.post("/register", validate(registerSchema, "body"), controller.register);
router.post("/login", validate(loginSchema, "body"), controller.login);
router.post("/logout", authenticate, controller.logout);
router.post("/password-reset/request", validate(passwordResetRequestSchema, "body"), controller.requestPasswordReset);
router.post("/password-reset/confirm", validate(passwordResetConfirmSchema, "body"), controller.confirmPasswordReset);

// Protected routes
router.get("/me", authenticate, controller.me);

export default router;
