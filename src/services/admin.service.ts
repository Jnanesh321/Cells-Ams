import { prisma } from "../config/prisma";

type AssignInput = {
  facultyUserId: number;
  subjectId: number;
  section: string;
  semester: string;
  academicYear: string;
  assignedByUserId: number;
};

export async function assignFacultyToClass(input: AssignInput) {
  const faculty = await prisma.user.findUnique({
    where: { id: input.facultyUserId },
    include: { facultyProfile: true },
  });

  if (!faculty || faculty.role !== "FACULTY" || !faculty.facultyProfile) {
    throw Object.assign(new Error("Faculty not found"), { status: 404 });
  }

  const subject = await prisma.subject.findUnique({ where: { id: input.subjectId } });
  if (!subject) {
    throw Object.assign(new Error("Subject not found"), { status: 404 });
  }

  return prisma.classAssignment.upsert({
    where: {
      subjectId_section_academicYear: {
        subjectId: input.subjectId,
        section: input.section,
        academicYear: input.academicYear,
      },
    },
    update: {
      facultyProfileId: faculty.facultyProfile.id,
      semester: input.semester,
      isActive: true,
      assignedByUserId: input.assignedByUserId,
    },
    create: {
      facultyProfileId: faculty.facultyProfile.id,
      subjectId: input.subjectId,
      section: input.section,
      semester: input.semester,
      academicYear: input.academicYear,
      assignedByUserId: input.assignedByUserId,
    },
    include: {
      subject: true,
      faculty: {
        include: { user: { select: { id: true, usn: true, name: true, email: true } } },
      },
    },
  });
}

export async function removeAssignment(id: number) {
  return prisma.classAssignment.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function listAllAssignments(deptId?: number) {
  return prisma.classAssignment.findMany({
    where: {
      ...(deptId ? { subject: { departmentId: deptId } } : {}),
    },
    orderBy: [{ createdAt: "desc" }],
    include: {
      subject: {
        select: {
          id: true,
          code: true,
          name: true,
          semester: true,
          departmentId: true,
        },
      },
      faculty: {
        include: {
          user: { select: { id: true, usn: true, name: true, email: true } },
        },
      },
      assignedBy: {
        select: { id: true, usn: true, name: true, role: true },
      },
    },
  });
}
