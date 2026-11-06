import { Router } from "express";
import authRoutes from "./auth/routes";
import schoolsRoutes from "./schools/routes";
// Future modules (uncomment as they are implemented):
// import usersRoutes from "./users/routes";
// import academicYearsRoutes from "./academic-years/routes";
// import gradeLevelsRoutes from "./grade-levels/routes";
// import sectionsRoutes from "./sections/routes";
// import subjectsRoutes from "./subjects/routes";
// import teachersRoutes from "./teachers/routes";
// import studentsRoutes from "./students/routes";
// import enrollmentsRoutes from "./enrollments/routes";
// import attendanceRoutes from "./attendance/routes";
// import gradingPeriodsRoutes from "./grading-periods/routes";
// import gradesRoutes from "./grades/routes";
// import announcementsRoutes from "./announcements/routes";
// import notificationsRoutes from "./notifications/routes";
// import auditLogsRoutes from "./audit-logs/routes";

const apiRouter = Router();

apiRouter.use("/auth", authRoutes);
apiRouter.use("/schools", schoolsRoutes);
// apiRouter.use("/users", usersRoutes);
// apiRouter.use("/academic-years", academicYearsRoutes);
// apiRouter.use("/grade-levels", gradeLevelsRoutes);
// apiRouter.use("/sections", sectionsRoutes);
// apiRouter.use("/subjects", subjectsRoutes);
// apiRouter.use("/teachers", teachersRoutes);
// apiRouter.use("/students", studentsRoutes);
// apiRouter.use("/enrollments", enrollmentsRoutes);
// apiRouter.use("/attendance", attendanceRoutes);
// apiRouter.use("/grading-periods", gradingPeriodsRoutes);
// apiRouter.use("/grades", gradesRoutes);
// apiRouter.use("/announcements", announcementsRoutes);
// apiRouter.use("/notifications", notificationsRoutes);
// apiRouter.use("/audit-logs", auditLogsRoutes);

export default apiRouter;
