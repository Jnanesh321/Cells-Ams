import { PrismaClient, Role, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const hash = (pw: string) => bcrypt.hashSync(pw, 10);

  // ==================== DEPARTMENTS ====================
  const cse = await prisma.department.upsert({
    where: { code: "CSE" },
    update: {},
    create: { name: "Computer Science & Engineering", code: "CSE" },
  });
  const aiml = await prisma.department.upsert({
    where: { code: "AIML" },
    update: {},
    create: { name: "Artificial Intelligence & Machine Learning", code: "AIML" },
  });
  const ece = await prisma.department.upsert({
    where: { code: "ECE" },
    update: {},
    create: { name: "Electronics & Communication Engineering", code: "ECE" },
  });
  const mech = await prisma.department.upsert({
    where: { code: "MECH" },
    update: {},
    create: { name: "Mechanical Engineering", code: "MECH" },
  });

  // ==================== SUBJECTS (Semester 2) ====================
  const cseSubjects = [
    { code: "24CS21", name: "Data Structures & Algorithms", credits: 4 },
    { code: "24CS22", name: "Object Oriented Programming", credits: 4 },
    { code: "24CS23", name: "Discrete Mathematical Structures", credits: 3 },
    { code: "24CS24", name: "Digital Design & Computer Organization", credits: 4 },
    { code: "24CS25", name: "Mathematics for Computing - II", credits: 3 },
    { code: "24CSL26", name: "Data Structures Lab", credits: 2 },
    { code: "24CSL27", name: "OOP Lab", credits: 2 },
    { code: "24CS28", name: "Environmental Science", credits: 2 },
  ];

  const aimlSubjects = [
    { code: "24AI21", name: "Data Structures & Algorithms", credits: 4 },
    { code: "24AI22", name: "Object Oriented Programming", credits: 4 },
    { code: "24AI23", name: "Discrete Mathematical Structures", credits: 3 },
    { code: "24AI24", name: "Digital Design & Computer Organization", credits: 4 },
    { code: "24AI25", name: "Mathematics for Computing - II", credits: 3 },
    { code: "24AIL26", name: "Data Structures Lab", credits: 2 },
    { code: "24AIL27", name: "OOP Lab", credits: 2 },
    { code: "24AI28", name: "Environmental Science", credits: 2 },
  ];

  const createdSubjects: Awaited<ReturnType<typeof prisma.subject.create>>[] = [];
  for (const s of cseSubjects) {
    const sub = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: { ...s, semester: "2", departmentId: cse.id },
    });
    createdSubjects.push(sub);
  }
  for (const s of aimlSubjects) {
    const sub = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: { ...s, semester: "2", departmentId: aiml.id },
    });
    createdSubjects.push(sub);
  }

  // ==================== ADMIN / HOD / PRINCIPAL / FACULTY ====================
  const admin = await prisma.user.upsert({
    where: { usn: "ADMIN001" },
    update: {},
    create: { usn: "ADMIN001", name: "System Admin", email: "admin@vcet.edu", passwordHash: hash("admin@123"), role: Role.ADMIN, departmentId: cse.id },
  });

  const hodCse = await prisma.user.upsert({
    where: { usn: "HOD_CSE" },
    update: {},
    create: { usn: "HOD_CSE", name: "Prof. Pradeep Kumar KG", email: "hod.cse@vcet.ac.in", passwordHash: hash("hod@123"), role: Role.HOD, departmentId: cse.id },
  });
  await prisma.facultyProfile.upsert({
    where: { userId: hodCse.id },
    update: {},
    create: { userId: hodCse.id, designation: "Head of Department" },
  });

  const hodAiml = await prisma.user.upsert({
    where: { usn: "HOD_AIML" },
    update: {},
    create: { usn: "HOD_AIML", name: "Dr. Ajith Hebbar Hosmata", email: "hod.aiml@vcet.edu", passwordHash: hash("hod@123"), role: Role.HOD, departmentId: aiml.id },
  });
  await prisma.facultyProfile.upsert({
    where: { userId: hodAiml.id },
    update: {},
    create: { userId: hodAiml.id, designation: "Head of Department" },
  });

  const principal = await prisma.user.upsert({
    where: { usn: "PRINCIPAL" },
    update: {},
    create: { usn: "PRINCIPAL", name: "Dr. Mahesh Prasanna K", email: "principal@vcet.edu", passwordHash: hash("principal@123"), role: Role.PRINCIPAL, departmentId: cse.id },
  });

  // CSE Faculty
  const cseFacultyData = [
    { usn: "FAC_CSE_001", name: "Mrs. Akshaya D. Shetty", designation: "Assistant Professor" },
    { usn: "FAC_CSE_002", name: "Mr. Ajay Shastry C G", designation: "Assistant Professor" },
    { usn: "FAC_CSE_003", name: "Mrs. Vaishnavi K V", designation: "Assistant Professor" },
    { usn: "FAC_CSE_004", name: "Mr. Venkatesh Y C", designation: "Assistant Professor" },
  ];

  const cseFacultyProfiles: Awaited<ReturnType<typeof prisma.facultyProfile.create>>[] = [];
  for (const f of cseFacultyData) {
    const user = await prisma.user.upsert({
      where: { usn: f.usn },
      update: {},
      create: { usn: f.usn, name: f.name, email: `${f.usn.toLowerCase()}@vcet.edu`, passwordHash: hash("faculty@123"), role: Role.FACULTY, departmentId: cse.id },
    });
    const fp = await prisma.facultyProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, designation: f.designation },
    });
    cseFacultyProfiles.push(fp);
  }

  // ==================== REAL STUDENTS ====================
  interface StudentEntry {
    usn: string;
    name: string;
    departmentId: number;
    section: string;
  }

  const realStudents: StudentEntry[] = [
    { usn: "4VP24CS038", name: "Jnanesh Sharma H", departmentId: cse.id, section: "A" },
    { usn: "4VP24CS089", name: "Shankar",        departmentId: cse.id, section: "A" },
    { usn: "4VP24CS074", name: "Kiran",           departmentId: cse.id, section: "A" },
    { usn: "4VP24CS049", name: "Ananya M",        departmentId: cse.id, section: "A" },
    { usn: "4VP24CS060", name: "Muralikrishna",    departmentId: cse.id, section: "A" },
    { usn: "4VP24CS051", name: "Manish DP",       departmentId: cse.id, section: "A" },
    { usn: "4VP24AI037", name: "Samved Balike",   departmentId: aiml.id, section: "A" },
  ];

  const studentProfiles: Awaited<ReturnType<typeof prisma.studentProfile.create>>[] = [];
  for (const s of realStudents) {
    const user = await prisma.user.upsert({
      where: { usn: s.usn },
      update: {},
      create: {
        usn: s.usn,
        name: s.name,
        email: `${s.usn.toLowerCase()}@vcet.edu`,
        passwordHash: hash("vcet@123"),
        role: Role.STUDENT,
        departmentId: s.departmentId,
      },
    });
    const sp = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, semester: "2", section: s.section, batch: "2024-2028" },
    });
    studentProfiles.push(sp);
  }

  // ==================== ADDITIONAL DEMO STUDENTS (Semester 2, section B) ====================
  const demoStudents: StudentEntry[] = [
    { usn: "4VP24CS061", name: "Demo Student 1", departmentId: cse.id, section: "B" },
    { usn: "4VP24CS062", name: "Demo Student 2", departmentId: cse.id, section: "B" },
    { usn: "4VP24CS063", name: "Demo Student 3", departmentId: cse.id, section: "B" },
  ];

  for (const s of demoStudents) {
    const user = await prisma.user.upsert({
      where: { usn: s.usn },
      update: {},
      create: {
        usn: s.usn,
        name: s.name,
        email: `${s.usn.toLowerCase()}@vcet.edu`,
        passwordHash: hash("vcet@123"),
        role: Role.STUDENT,
        departmentId: s.departmentId,
      },
    });
    const sp = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, semester: "2", section: s.section, batch: "2024-2028" },
    });
    studentProfiles.push(sp);
  }

  // ==================== PARENTS ====================
  const parentData = [
    { usn: "PARENT_4VP24CS038", name: "Jnanesh Parent", childUsn: "4VP24CS038" },
    { usn: "PARENT_4VP24CS089", name: "Shankar Parent", childUsn: "4VP24CS089" },
    { usn: "PARENT_4VP24AI037", name: "Samved Parent", childUsn: "4VP24AI037" },
  ];

  for (const p of parentData) {
    const child = await prisma.user.findUnique({ where: { usn: p.childUsn } });
    if (!child) continue;
    const parent = await prisma.user.upsert({
      where: { usn: p.usn },
      update: {},
      create: { usn: p.usn, name: p.name, email: `${p.usn.toLowerCase()}@vcet.edu`, passwordHash: hash("parent@123"), role: Role.PARENT, departmentId: child.departmentId ?? undefined },
    });
    await prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId: parent.id, studentId: child.id } },
      update: {},
      create: { parentId: parent.id, studentId: child.id },
    });
  }

  // ==================== CLASS ASSIGNMENTS ====================
  const cseSubjectsSem2 = createdSubjects.filter(s => s.code.startsWith("24CS"));
  for (let s = 0; s < cseSubjectsSem2.length; s++) {
    const facultyIdx = s % cseFacultyProfiles.length;
    for (const section of ["A", "B"]) {
      await prisma.classAssignment.upsert({
        where: { subjectId_section_academicYear: { subjectId: cseSubjectsSem2[s].id, section, academicYear: "2025-2026" } },
        update: {},
        create: {
          facultyProfileId: cseFacultyProfiles[facultyIdx].id,
          subjectId: cseSubjectsSem2[s].id,
          section,
          semester: "2",
          academicYear: "2025-2026",
          assignedByUserId: admin.id,
        },
      });
    }
  }

  // ==================== ATTENDANCE RECORDS (30 days) ====================
  const startDate = new Date("2025-04-01");
  for (let day = 0; day < 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    const subjectIdx = day % cseSubjectsSem2.length || 0;
    const subj = cseSubjectsSem2[subjectIdx];

    for (const sp of studentProfiles) {
      const rand = Math.random();
      let status: AttendanceStatus;
      if (rand < 0.10) status = AttendanceStatus.ABSENT;
      else if (rand < 0.15) status = AttendanceStatus.OD;
      else status = AttendanceStatus.PRESENT;

      await prisma.attendanceRecord.create({
        data: {
          studentProfileId: sp.id,
          subjectId: subj.id,
          date,
          status,
          markedByUserId: admin.id,
        },
      }).catch(() => {});
    }
  }

  // ==================== IA MARKS (Old System) ====================
  for (const sp of studentProfiles) {
    for (const subj of cseSubjectsSem2) {
      for (let iaNum = 1; iaNum <= 3; iaNum++) {
        const marks = 18 + Math.floor(Math.random() * 12);
        await prisma.iAMark.upsert({
          where: { studentProfileId_subjectId_iaNumber: { studentProfileId: sp.id, subjectId: subj.id, iaNumber: iaNum } },
          update: {},
          create: {
            studentProfileId: sp.id,
            subjectId: subj.id,
            iaNumber: iaNum,
            marksObtained: marks,
            maxMarks: 30,
            enteredByUserId: admin.id,
          },
        });
      }
    }
  }

  // ==================== VTU IA MARKS (New Q1-Q4 System) ====================
  for (const sp of studentProfiles) {
    for (const subj of cseSubjectsSem2) {
      for (let iaNum = 1; iaNum <= 2; iaNum++) {
        const q1 = 15 + Math.floor(Math.random() * 11);
        const q2 = 16 + Math.floor(Math.random() * 10);
        const q3 = 14 + Math.floor(Math.random() * 12);
        const q4 = 15 + Math.floor(Math.random() * 11);
        const sectionA = Math.max(q1, q2);
        const sectionB = Math.max(q3, q4);
        const total = Math.min(sectionA + sectionB, 50);

        await prisma.vTUIAMark.upsert({
          where: { studentProfileId_subjectId_iaNumber: { studentProfileId: sp.id, subjectId: subj.id, iaNumber: iaNum } },
          update: {},
          create: {
            studentProfileId: sp.id,
            subjectId: subj.id,
            iaNumber: iaNum,
            q1, q2, q3, q4,
            sectionA, sectionB, total,
            enteredByUserId: admin.id,
          },
        });
      }
      // IA3 not entered yet (simulate pending)
    }
  }

  // ==================== VTU CIE SUMMARIES ====================
  for (const sp of studentProfiles) {
    for (const subj of cseSubjectsSem2) {
      const vtuMarks = await prisma.vTUIAMark.findMany({
        where: { studentProfileId: sp.id, subjectId: subj.id },
        orderBy: { iaNumber: "asc" },
      });

      const iaTotals = [0, 0, 0];
      for (const m of vtuMarks) {
        if (m.iaNumber >= 1 && m.iaNumber <= 3) iaTotals[m.iaNumber - 1] = m.total;
      }

      const sorted = [...iaTotals].sort((a, b) => b - a);
      const bestTwoTotal = sorted[0] + sorted[1];
      const finalCIE = Math.min(bestTwoTotal, 50);

      await prisma.vTUCIESummary.upsert({
        where: { studentProfileId_subjectId: { studentProfileId: sp.id, subjectId: subj.id } },
        update: {},
        create: {
          studentProfileId: sp.id,
          subjectId: subj.id,
          ia1Total: iaTotals[0],
          ia2Total: iaTotals[1],
          ia3Total: iaTotals[2],
          bestTwoTotal,
          finalCIE,
          isEligible: finalCIE >= 20,
          finalized: false,
        },
      });
    }
  }

  // ==================== COUNSELLING ASSIGNMENTS (Placeholder) ====================
  if (cseFacultyProfiles.length > 0) {
    for (let i = 0; i < Math.min(studentProfiles.length, 5); i++) {
      const facultyUser = await prisma.user.findUnique({
        where: { usn: cseFacultyData[i % cseFacultyData.length].usn },
      });
      const studentUser = await prisma.user.findUnique({
        where: { usn: realStudents[i]?.usn ?? demoStudents[i - realStudents.length]?.usn },
      });
      if (!facultyUser || !studentUser) continue;

      await prisma.counsellorAssignment.upsert({
        where: {
          facultyUserId_studentUserId_academicYear: {
            facultyUserId: facultyUser.id,
            studentUserId: studentUser.id,
            academicYear: "2025-2026",
          },
        },
        update: {},
        create: {
          facultyUserId: facultyUser.id,
          studentUserId: studentUser.id,
          departmentId: cse.id,
          academicYear: "2025-2026",
          isActive: true,
          assignedById: hodCse.id,
        },
      });
    }
  }

  // ==================== NOTICES ====================
  const noticesData = [
    { title: "IA2 Examination Schedule", content: "Internal Assessment 2 will be conducted from June 2-7, 2025. All students must carry their college ID cards.", targetRole: Role.STUDENT as Role | null },
    { title: "Attendance Shortage Notice", content: "Students with attendance below 75% must submit medical certificates to HOD on or before June 10, 2025.", targetRole: Role.STUDENT as Role | null },
    { title: "Parent-Teacher Meeting", content: "PTM for semester 2 students will be held on June 15, 2025 at 10:00 AM in the main auditorium.", targetRole: Role.PARENT as Role | null },
    { title: "Faculty Meeting - Curriculum Review", content: "All faculty members must attend the curriculum review meeting on June 5, 2025.", targetRole: Role.FACULTY as Role | null },
    { title: "College Foundation Day", content: "VCET Foundation Day celebration on May 28, 2025. All students and staff must attend.", targetRole: null },
  ];

  for (const n of noticesData) {
    await prisma.notice.create({
      data: { ...n, postedByUserId: admin.id, isActive: true, departmentId: cse.id },
    });
  }

  // ==================== ACADEMIC CALENDAR ====================
  const calendarData = [
    { title: "IA2 Examinations", description: "Internal Assessment 2 for all semesters", startDate: new Date("2025-06-02"), endDate: new Date("2025-06-07"), type: "exam" },
    { title: "Semester End Practical Exams", description: "Practical examinations for all courses", startDate: new Date("2025-06-16"), endDate: new Date("2025-06-25"), type: "exam" },
    { title: "Semester Break", description: "Summer semester break", startDate: new Date("2025-06-26"), endDate: new Date("2025-07-15"), type: "holiday" },
  ];

  for (const c of calendarData) {
    await prisma.academicCalendar.create({ data: c });
  }

  console.log("Seeding complete.");
  console.log(`  Departments: CSE, AIML, ECE, MECH`);
  console.log(`  Subjects: ${createdSubjects.length}`);
  console.log(`  Students: ${studentProfiles.length}`);
  console.log(`  Login: 4VP24CS038 / vcet@123`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
