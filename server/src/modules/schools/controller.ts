import type { Request, Response } from "express";
import * as schoolService from "./service";
import { sendSuccess, sendError } from "../../utils/response";
import { asyncHandler } from "../../middleware/error";
import { updateSchoolSchema } from "./schema";
import { getSchoolId } from "../../middleware/tenant";

export const getProfile = asyncHandler(async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  if (!schoolId) {
    sendError(res, "NO_SCHOOL_CONTEXT", "No school context", 400);
    return;
  }
  const school = await schoolService.getSchoolProfile(schoolId);
  sendSuccess(res, { school });
});

export const updateProfile = asyncHandler(async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  if (!schoolId) {
    sendError(res, "NO_SCHOOL_CONTEXT", "No school context", 400);
    return;
  }
  const input = updateSchoolSchema.parse(req.body);
  const school = await schoolService.updateSchoolProfile(schoolId, input);
  sendSuccess(res, { school });
});

export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  if (!schoolId) {
    sendError(res, "NO_SCHOOL_CONTEXT", "No school context", 400);
    return;
  }
  const users = await schoolService.getSchoolUsers(schoolId);
  sendSuccess(res, { users });
});

export const deactivateUser = asyncHandler(async (req: Request, res: Response) => {
  const schoolId = getSchoolId(req);
  if (!schoolId) {
    sendError(res, "NO_SCHOOL_CONTEXT", "No school context", 400);
    return;
  }
  const { userId } = req.params;
  await schoolService.deactivateUser(schoolId, userId);
  sendSuccess(res, { message: "User deactivated" });
});
