import { Router } from "express";
import { authenticate } from "../../middleware/auth";
import { tenantIsolation } from "../../middleware/tenant";
import { requireRole } from "../../middleware/rbac";
import { validate } from "../../middleware/validation";
import { asyncHandler } from "../../middleware/error";
import { updateSchoolSchema } from "./schema";
import * as controller from "./controller";

const router = Router();

// All school routes require authentication + tenant isolation
router.use(asyncHandler(authenticate));
router.use(asyncHandler(tenantIsolation));

router.get("/me", controller.getProfile);
router.patch("/me", validate(updateSchoolSchema, "body"), controller.updateProfile);
router.get("/users", requireRole("SCHOOL_ADMIN", "PLATFORM_ADMIN"), controller.getUsers);
router.delete("/users/:userId", requireRole("SCHOOL_ADMIN", "PLATFORM_ADMIN"), controller.deactivateUser);

export default router;
