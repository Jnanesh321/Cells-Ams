-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'ADMIN';

-- CreateTable
CREATE TABLE "class_assignments" (
    "id" SERIAL NOT NULL,
    "facultyProfileId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "academicYear" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "assignedByUserId" INTEGER NOT NULL,
    "assignedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "class_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ia_marks" (
    "id" SERIAL NOT NULL,
    "studentProfileId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "iaNumber" INTEGER NOT NULL,
    "marksObtained" DOUBLE PRECISION NOT NULL,
    "maxMarks" DOUBLE PRECISION NOT NULL DEFAULT 30,
    "enteredByUserId" INTEGER NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ia_marks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "class_assignments_facultyProfileId_isActive_idx" ON "class_assignments"("facultyProfileId", "isActive");

-- CreateIndex
CREATE UNIQUE INDEX "class_assignments_subjectId_section_academicYear_key" ON "class_assignments"("subjectId", "section", "academicYear");

-- CreateIndex
CREATE INDEX "ia_marks_studentProfileId_idx" ON "ia_marks"("studentProfileId");

-- CreateIndex
CREATE UNIQUE INDEX "ia_marks_studentProfileId_subjectId_iaNumber_key" ON "ia_marks"("studentProfileId", "subjectId", "iaNumber");

-- AddForeignKey
ALTER TABLE "class_assignments" ADD CONSTRAINT "class_assignments_facultyProfileId_fkey" FOREIGN KEY ("facultyProfileId") REFERENCES "faculty_profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_assignments" ADD CONSTRAINT "class_assignments_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "class_assignments" ADD CONSTRAINT "class_assignments_assignedByUserId_fkey" FOREIGN KEY ("assignedByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ia_marks" ADD CONSTRAINT "ia_marks_studentProfileId_fkey" FOREIGN KEY ("studentProfileId") REFERENCES "student_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ia_marks" ADD CONSTRAINT "ia_marks_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "subjects"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ia_marks" ADD CONSTRAINT "ia_marks_enteredByUserId_fkey" FOREIGN KEY ("enteredByUserId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
