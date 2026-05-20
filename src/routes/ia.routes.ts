import { Router } from "express";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { examCellGuard } from "../middleware/examCellGuard";
import { asyncHandler } from "../utils/asyncHandler";
import { IAController } from "../controllers/ia.controller";

const router = Router();

// ── Question Paper Management (EXAM_CELL only) ──
router.post(
  "/question-paper",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.createQuestionPaper)
);

router.get(
  "/question-papers",
  auth,
  requireRole("EXAM_CELL", "FACULTY", "HOD"),
  asyncHandler(IAController.listQuestionPapers)
);

router.get(
  "/question-paper/:id",
  auth,
  requireRole("EXAM_CELL", "FACULTY", "HOD"),
  asyncHandler(IAController.getQuestionPaper)
);

router.put(
  "/question-paper/:id",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.updateQuestionPaper)
);

router.post(
  "/question-paper/:id/questions",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.addQuestions)
);

router.put(
  "/question/:id",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.updateQuestion)
);

router.delete(
  "/question/:id",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.deleteQuestion)
);

router.post(
  "/question/:id/sub-questions",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.addSubQuestions)
);

// ── Marks Entry (FACULTY / EXAM_CELL) ──
router.get(
  "/marks/:paperId",
  auth,
  requireRole("FACULTY", "EXAM_CELL", "HOD"),
  asyncHandler(IAController.getMarks)
);

router.put(
  "/marks/:paperId",
  auth,
  requireRole("FACULTY", "EXAM_CELL"),
  asyncHandler(IAController.upsertMarks)
);

// ── Absentee Management (EXAM_CELL only) ──
router.get(
  "/absentees/:paperId",
  auth,
  requireRole("EXAM_CELL", "FACULTY", "HOD"),
  examCellGuard,
  asyncHandler(IAController.getAbsentees)
);

router.post(
  "/absentees/:paperId",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.markAbsentees)
);

router.delete(
  "/absentees/:paperId",
  auth,
  requireRole("EXAM_CELL"),
  asyncHandler(IAController.unmarkAbsentees)
);

// ── Lab IA Marks ──
router.get(
  "/lab-config/:subjectId",
  auth,
  requireRole("EXAM_CELL", "FACULTY", "HOD", "ADMIN"),
  asyncHandler(IAController.getLabConfig)
);

router.put(
  "/lab-config/:subjectId",
  auth,
  requireRole("ADMIN"),
  asyncHandler(IAController.upsertLabConfig)
);

router.get(
  "/lab-marks/:subjectId",
  auth,
  requireRole("FACULTY", "EXAM_CELL", "HOD"),
  asyncHandler(IAController.getLabMarks)
);

router.put(
  "/lab-marks/:subjectId",
  auth,
  requireRole("FACULTY", "EXAM_CELL"),
  asyncHandler(IAController.upsertLabMarks)
);

// ── Calculation / Results ──
router.get(
  "/result/:paperId",
  auth,
  requireRole("FACULTY", "EXAM_CELL", "HOD"),
  asyncHandler(IAController.getResult)
);

// ── Student View ──
router.get(
  "/my-marks/:subjectId",
  auth,
  requireRole("STUDENT"),
  asyncHandler(IAController.getMyMarks)
);

export default router;
