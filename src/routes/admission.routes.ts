import { Router } from "express";
import { z } from "zod";
import bcrypt from "bcrypt";
import { asyncHandler } from "../utils/asyncHandler";
import { auth } from "../middleware/auth";
import { requireRole } from "../middleware/role";
import { prisma } from "../config/prisma";
import { ok, fail } from "../utils/apiResponse";

const router = Router();

function generateUSN(deptCode: string, year: number, rollNo: number): string {
  const yearStr = String(year).slice(-2);
  return `${deptCode}${yearStr}${String(rollNo).padStart(3, "0")}`;
}

// Create a single student (Admin/Admission Cell)
router.post(
  "/create-student",
  auth,
  requireRole("ADMIN", "ADMISSION_CELL"),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(1),
      email: z.string().email().optional(),
      departmentId: z.number().int().positive(),
      section: z.string().length(1).toUpperCase(),
      semester: z.coerce.string().min(1),
      batch: z.string().default("2024-2025"),
      rollNo: z.number().int().positive().optional(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const d = parsed.data;

    const dept = await prisma.department.findUnique({ where: { id: d.departmentId }, select: { code: true } });
    if (!dept) return fail(res, "Department not found", 404);

    const nextRollNo = d.rollNo ?? (await getNextRollNo(d.departmentId));
    const usn = generateUSN(dept.code, new Date().getFullYear(), nextRollNo);
    const passwordHash = await bcrypt.hash("vcet@123", 10);

    const student = await prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          usn,
          name: d.name,
          email: d.email,
          passwordHash,
          role: "STUDENT",
          departmentId: d.departmentId,
        },
      });

      await tx.studentProfile.create({
        data: {
          userId: user.id,
          semester: d.semester,
          section: d.section,
          batch: d.batch,
        },
      });

      return user;
    });

    ok(res, { usn: student.usn, name: student.name, defaultPassword: "vcet@123" });
  })
);

// Create admission batch definition
router.post(
  "/batch/create",
  auth,
  requireRole("ADMIN", "ADMISSION_CELL"),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      department: z.string().min(1),
      year: z.number().int(),
      section: z.string().length(1).toUpperCase(),
      intakeSize: z.number().int().positive(),
      startRollNo: z.number().int().positive(),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const d = parsed.data;
    const id = `${d.department}-${d.year}-${d.section}`;

    const batch = await prisma.admissionBatch.upsert({
      where: { id },
      update: { intakeSize: d.intakeSize, endRollNo: d.startRollNo + d.intakeSize - 1 },
      create: {
        id, department: d.department, year: d.year, section: d.section,
        intakeSize: d.intakeSize, startRollNo: d.startRollNo,
        endRollNo: d.startRollNo + d.intakeSize - 1,
      },
    });

    ok(res, batch);
  })
);

// List all admission batches
router.get(
  "/batches",
  auth,
  requireRole("ADMIN", "ADMISSION_CELL", "HOD"),
  asyncHandler(async (req, res) => {
    const batches = await prisma.admissionBatch.findMany({
      orderBy: [{ year: "desc" }, { department: "asc" }],
    });
    ok(res, batches);
  })
);

// Bulk create students from a batch definition
router.post(
  "/batch/apply",
  auth,
  requireRole("ADMIN", "ADMISSION_CELL"),
  asyncHandler(async (req, res) => {
    const schema = z.object({
      batchId: z.string().min(1),
      departmentId: z.number().int().positive(),
      section: z.string().length(1).toUpperCase(),
      semester: z.coerce.string().min(1),
      batch: z.string().default("2024-2025"),
      studentNames: z.array(z.string().min(1)).min(1).max(120),
      createParents: z.boolean().default(false),
    });

    const parsed = schema.safeParse(req.body);
    if (!parsed.success) return fail(res, "Validation failed", 400, parsed.error.flatten());
    const d = parsed.data;

    const batch = await prisma.admissionBatch.findUnique({ where: { id: d.batchId } });
    if (!batch) return fail(res, "Batch not found", 404);

    const dept = await prisma.department.findUnique({ where: { id: d.departmentId }, select: { code: true } });
    if (!dept) return fail(res, "Department not found", 404);

    const passwordHash = await bcrypt.hash("vcet@123", 10);
    const results: { usn: string; name: string }[] = [];
    const errors: { name: string; error: string }[] = [];

    for (let i = 0; i < d.studentNames.length; i++) {
      const name = d.studentNames[i];
      const rollNo = batch.startRollNo + i;
      const usn = generateUSN(dept.code, batch.year, rollNo);

      try {
        await prisma.$transaction(async (tx) => {
          const user = await tx.user.create({
            data: { usn, name, passwordHash, role: "STUDENT", departmentId: d.departmentId },
          });

          await tx.studentProfile.create({
            data: { userId: user.id, semester: d.semester, section: d.section, batch: d.batch },
          });

          if (d.createParents) {
            const parentUsn = `PARENT_${usn}`;
            const parent = await tx.user.upsert({
              where: { usn: parentUsn },
              update: {},
              create: {
                usn: parentUsn, name: `${name}'s Parent`,
                passwordHash, role: "PARENT", departmentId: d.departmentId,
              },
            });

            await tx.parentStudent.upsert({
              where: { parentId_studentId: { parentId: parent.id, studentId: user.id } },
              update: {},
              create: { parentId: parent.id, studentId: user.id },
            });
          }
        });

        results.push({ usn, name });
      } catch (err: any) {
        errors.push({ name, error: err.message });
      }
    }

    ok(res, { created: results.length, errors: errors.length, results, errorDetails: errors });
  })
);

async function getNextRollNo(departmentId: number): Promise<number> {
  const lastUser = await prisma.user.findFirst({
    where: { departmentId, role: "STUDENT" },
    orderBy: { createdAt: "desc" },
    select: { usn: true },
  });

  if (!lastUser?.usn) return 1;
  const match = lastUser.usn.match(/(\d{3})$/);
  return match ? Number(match[1]) + 1 : 1;
}

export default router;
