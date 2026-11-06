import { z } from "zod";

export const schoolProfileSchema = z.object({
  name: z.string().min(1, "School name is required"),
  address: z.string().optional(),
  contactEmail: z.string().email("Invalid email").optional().or(z.literal("")),
  contactPhone: z.string().optional(),
  logoUrl: z.string().url("Invalid logo URL").optional().or(z.literal("")),
});

export const updateSchoolSchema = schoolProfileSchema.partial();

export type SchoolProfileInput = z.infer<typeof schoolProfileSchema>;
export type UpdateSchoolInput = z.infer<typeof updateSchoolSchema>;
