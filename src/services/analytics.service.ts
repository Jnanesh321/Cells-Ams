import { prisma } from "../config/prisma";

type CollegeAnalyticsRow = {
  deptCode: string;
  deptName: string;
  studentCount: number;
  avgAttendance: number;
  avgIA: number;
};

function roundToOneDecimal(value: number): number {
  return Number(value.toFixed(1));
}

export async function getCollegeAnalytics(): Promise<CollegeAnalyticsRow[]> {
  const departments = await prisma.department.findMany({
    select: {
      id: true,
      code: true,
      name: true,
    },
    orderBy: { code: "asc" },
  });

  const rows: CollegeAnalyticsRow[] = [];

  for (const department of departments) {
    const studentCount = await prisma.studentProfile.count({
      where: {
        user: {
          role: "STUDENT",
          departmentId: department.id,
        },
      },
    });

    const attendanceGroups = await prisma.attendanceRecord.groupBy({
      by: ["studentProfileId", "status"],
      where: {
        studentProfile: {
          user: {
            role: "STUDENT",
            departmentId: department.id,
          },
        },
      },
      _count: {
        _all: true,
      },
    });

    const attendanceByStudent = new Map<number, { present: number; total: number }>();

    for (const group of attendanceGroups) {
      const current = attendanceByStudent.get(group.studentProfileId) ?? {
        present: 0,
        total: 0,
      };

      current.total += group._count._all;
      if (group.status === "PRESENT") {
        current.present += group._count._all;
      }

      attendanceByStudent.set(group.studentProfileId, current);
    }

    const attendancePercentages = Array.from(attendanceByStudent.values())
      .filter((student) => student.total > 0)
      .map((student) => (student.present / student.total) * 100);

    const avgAttendance =
      attendancePercentages.length > 0
        ? attendancePercentages.reduce((sum, value) => sum + value, 0) /
          attendancePercentages.length
        : 0;

    const avgIAMark = await prisma.iAMark.aggregate({
      where: {
        studentProfile: {
          user: {
            role: "STUDENT",
            departmentId: department.id,
          },
        },
      },
      _avg: {
        marksObtained: true,
      },
    });

    rows.push({
      deptCode: department.code,
      deptName: department.name,
      studentCount,
      avgAttendance: roundToOneDecimal(avgAttendance),
      avgIA: roundToOneDecimal(avgIAMark._avg.marksObtained ?? 0),
    });
  }

  return rows;
}