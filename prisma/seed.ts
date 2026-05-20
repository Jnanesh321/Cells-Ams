import { PrismaClient, Role, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();
const hash = (pw: string) => bcrypt.hashSync(pw, 10);

// ── Helpers ──────────────────────────────────────────────────────────
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function rng(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

function workingDays(count: number, start: Date): Date[] {
  const days: Date[] = [];
  let d = new Date(start);
  while (days.length < count) {
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) days.push(new Date(d));
    d.setDate(d.getDate() + 1);
  }
  return days;
}

function normalScore(mean: number, std: number, min: number, max: number): number {
  const u1 = Math.random();
  const u2 = Math.random();
  const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
  const val = mean + z * std;
  return Math.round(Math.max(min, Math.min(max, val)));
}

const firstNamesM = [
  "Aarav", "Abhishek", "Aditya", "Akhil", "Akshay", "Amit", "Ankit", "Anoop",
  "Arjun", "Arun", "Ashok", "Ashwin", "Bharath", "Chandan", "Charan", "Chethan",
  "Darshan", "Deepak", "Devaraj", "Dhruva", "Ganesh", "Girish", "Guru", "Hari",
  "Harsha", "Hemanth", "Imran", "Jagadish", "Jai", "Karan", "Karthik", "Kishore",
  "Kumar", "Lokesh", "Madhu", "Mahesh", "Manjunath", "Manoj", "Mohan", "Nandan",
  "Naveen", "Nikhil", "Nitin", "Omkar", "Pavan", "Pradeep", "Prasanna", "Raghav",
  "Rahul", "Raj", "Rakesh", "Ram", "Ramesh", "Ranjith", "Ravi", "Rohit", "Sachin",
  "Sandeep", "Santosh", "Sathish", "Shashank", "Shiva", "Siddharth", "Srinivas",
  "Sudhir", "Sumanth", "Sunil", "Suraj", "Suresh", "Tushar", "Uday", "Umesh",
  "Varun", "Venkatesh", "Vijay", "Vinay", "Vinod", "Vishal", "Yash",
];

const firstNamesF = [
  "Aishwarya", "Akshatha", "Amrutha", "Ananya", "Anitha", "Anjali", "Anushree",
  "Apoorva", "Archana", "Arpitha", "Ashwini", "Bhavana", "Bhoomika", "Chaithra",
  "Deepa", "Deepika", "Devika", "Divya", "Durga", "Esha", "Gayathri", "Geetha",
  "Harini", "Harshitha", "Indira", "Jaya", "Jyothi", "Kavana", "Kavitha",
  "Keerthi", "Lakshmi", "Latha", "Madhuri", "Mamatha", "Manasa", "Maya", "Megha",
  "Nandini", "Neelaveni", "Nisha", "Pallavi", "Parvathi", "Pavitra", "Pooja",
  "Prajna", "Prathima", "Priya", "Pushpa", "Radhika", "Ragini", "Raksha",
  "Ramya", "Ranjitha", "Rashmi", "Revathi", "Roopa", "Sahana", "Sangeetha",
  "Sanjana", "Saraswathi", "Saritha", "Savitha", "Shilpa", "Shreya", "Shruthi",
  "Sindhu", "Sneha", "Soumya", "Spoorthi", "Sridevi", "Sujatha", "Suma",
  "Sushmitha", "Swathi", "Tara", "Uma", "Usha", "Vaishnavi", "Vani", "Varsha",
  "Vidya", "Vijetha", "Vimala", "Yamuna",
];

const lastNames = [
  "Acharya", "Achar", "Bhat", "Bhatt", "Chandrashekar", "Desai", "Gowda",
  "Gupta", "Hegde", "Jain", "Joshi", "Kamath", "Kini", "Kulkarni", "Kumar",
  "Mallya", "Menon", "Naik", "Nair", "Pai", "Pandey", "Patel", "Prabhu", "Rai",
  "Raj", "Rao", "Reddy", "Shenoy", "Shetty", "Sharma", "Singh", "Srinivas",
  "Surya", "Verma", "Murthy", "Iyer", "Shastry", "Bhatta", "Mohan", "Shanbhag",
  "Upadhyaya", "Krishna", "Prasad", "Nayak", "Kurian", "George", "Philip",
  "Fernandes", "Pereira", "Pais", "Dias", "Rodrigues",
];

function makeStudentName(used: Set<string>): string {
  for (let i = 0; i < 100; i++) {
    const g = Math.random() < 0.5 ? firstNamesM : firstNamesF;
    const name = `${pick(g)} ${pick(lastNames)}`;
    if (!used.has(name.toLowerCase())) {
      used.add(name.toLowerCase());
      return name;
    }
  }
  return `Student-${used.size + 1}`;
}

function makeDOB(): Date {
  const y = rng(2004, 2006);
  const m = rng(1, 12);
  const d = rng(1, 28);
  return new Date(y, m - 1, d);
}

// ── Main Seed ────────────────────────────────────────────────────────
async function main() {
  console.log("🌱 Seeding database...");

  // ── Clear existing data (dependency-safe order) ──
  await prisma.vTUCIESummary.deleteMany();
  await prisma.vTUIAMark.deleteMany();
  await prisma.counsellingSession.deleteMany();
  await prisma.counsellorAssignment.deleteMany();
  await prisma.detentionRecord.deleteMany();
  await prisma.cIESummary.deleteMany();
  await prisma.assignmentMark.deleteMany();
  await prisma.iAMark.deleteMany();
  await prisma.attendanceRecord.deleteMany();
  await prisma.classAssignment.deleteMany();
  await prisma.subjectMapping.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.parentStudent.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.facultyProfile.deleteMany();
  await prisma.birthdayVisibility.deleteMany();
  await prisma.refreshToken.deleteMany();
  await prisma.studentDraft.deleteMany();
  await prisma.admissionBatch.deleteMany();
  await prisma.notice.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.dayOverride.deleteMany();
  await prisma.user.deleteMany();
  await prisma.period.deleteMany();
  await prisma.academicCalendar.deleteMany();
  await prisma.academicDayState.deleteMany();
  await prisma.rollNumberSequence.deleteMany();
  await prisma.department.deleteMany();
  console.log("  ✓ Cleared existing data");

  // ── 1. Departments ──
  const cse = await prisma.department.create({
    data: { name: "Computer Science & Engineering", code: "CSE" },
  });
  const ece = await prisma.department.create({
    data: { name: "Electronics & Communication Engineering", code: "ECE" },
  });
  console.log("  ✓ Departments: CSE, ECE");

  // ── 2. Subjects (VTU 2022 Scheme — Semester 4) ──
  const cseSubDefs = [
    { code: "BCS401", name: "Analysis & Design of Algorithms", credits: 4 },
    { code: "BCS402", name: "Microcontroller & Embedded Systems", credits: 4 },
    { code: "BCS403", name: "Database Management Systems", credits: 4 },
    { code: "BCS404", name: "Python Programming", credits: 3 },
    { code: "BCS405A", name: "Computer Networks", credits: 3 },
  ];
  const eceSubDefs = [
    { code: "BEC401", name: "Analog Communication", credits: 4 },
    { code: "BEC402", name: "Digital Signal Processing", credits: 4 },
    { code: "BEC403", name: "Embedded Systems", credits: 4 },
    { code: "BEC404", name: "Python for Engineers", credits: 3 },
    { code: "BEC405A", name: "IoT Fundamentals", credits: 3 },
  ];

  const cseSubjects: Awaited<ReturnType<typeof prisma.subject.create>>[] = [];
  for (const s of cseSubDefs) {
    cseSubjects.push(await prisma.subject.create({ data: { ...s, semester: "4", departmentId: cse.id } }));
  }
  const eceSubjects: Awaited<ReturnType<typeof prisma.subject.create>>[] = [];
  for (const s of eceSubDefs) {
    eceSubjects.push(await prisma.subject.create({ data: { ...s, semester: "4", departmentId: ece.id } }));
  }
  console.log(`  ✓ Subjects: ${cseSubDefs.length} CSE + ${eceSubDefs.length} ECE`);

  // ── 3. Admin & Principal ──
  const admin = await prisma.user.create({
    data: {
      usn: "ADMIN001", name: "System Admin", email: "admin@vcet.edu",
      passwordHash: hash("admin@123"), role: Role.ADMIN, departmentId: cse.id,
    },
  });
  const principal = await prisma.user.create({
    data: {
      usn: "PRINCIPAL", name: "Dr. Mahesh Prasanna K", email: "principal@vcet.edu",
      passwordHash: hash("principal@123"), role: Role.PRINCIPAL, departmentId: cse.id,
    },
  });
  console.log("  ✓ Admin & Principal");

  // ── 4. HODs + Faculty ──
  const cseFacultyData = [
    { usn: "FAC_CSE_001", name: "Dr. Linju Joseph", designation: "Associate Professor" },
    { usn: "FAC_CSE_002", name: "Prof. Bharathi S", designation: "Assistant Professor" },
    { usn: "FAC_CSE_003", name: "Prof. Mamatha R", designation: "Assistant Professor" },
    { usn: "FAC_CSE_004", name: "Dr. Kavitha S", designation: "Associate Professor" },
    { usn: "FAC_CSE_005", name: "Prof. Jagadish Y", designation: "Assistant Professor" },
  ];
  const eceFacultyData = [
    { usn: "FAC_ECE_001", name: "Dr. Naveenakrishna P V", designation: "Associate Professor" },
    { usn: "FAC_ECE_002", name: "Prof. Surekha T", designation: "Assistant Professor" },
    { usn: "FAC_ECE_003", name: "Prof. Deepak Kumar S", designation: "Assistant Professor" },
    { usn: "FAC_ECE_004", name: "Dr. Rajeshwari M", designation: "Associate Professor" },
    { usn: "FAC_ECE_005", name: "Prof. Shruthi S", designation: "Assistant Professor" },
  ];

  // HOD CSE
  const hodCseUser = await prisma.user.create({
    data: {
      usn: "HOD_CSE", name: "Prof. Pradeep Kumar KG", email: "hod.cse@vcet.ac.in",
      passwordHash: hash("hod@123"), role: Role.HOD, departmentId: cse.id,
    },
  });
  const hodCseProfile = await prisma.facultyProfile.create({
    data: { userId: hodCseUser.id, designation: "Head of Department" },
  });

  // HOD ECE
  const hodEceUser = await prisma.user.create({
    data: {
      usn: "HOD_ECE", name: "Dr. Shobha K", email: "hod.ece@vcet.ac.in",
      passwordHash: hash("hod@123"), role: Role.HOD, departmentId: ece.id,
    },
  });
  const hodEceProfile = await prisma.facultyProfile.create({
    data: { userId: hodEceUser.id, designation: "Head of Department" },
  });

  // CSE Faculty
  const cseFacultyProfiles: Awaited<ReturnType<typeof prisma.facultyProfile.create>>[] = [];
  for (const f of cseFacultyData) {
    const u = await prisma.user.create({
      data: {
        usn: f.usn, name: f.name, email: `${f.usn.toLowerCase()}@vcet.edu`,
        passwordHash: hash("faculty@123"), role: Role.FACULTY, departmentId: cse.id,
      },
    });
    const fp = await prisma.facultyProfile.create({
      data: { userId: u.id, designation: f.designation },
    });
    cseFacultyProfiles.push(fp);
  }

  // ECE Faculty
  const eceFacultyProfiles: Awaited<ReturnType<typeof prisma.facultyProfile.create>>[] = [];
  for (const f of eceFacultyData) {
    const u = await prisma.user.create({
      data: {
        usn: f.usn, name: f.name, email: `${f.usn.toLowerCase()}@vcet.edu`,
        passwordHash: hash("faculty@123"), role: Role.FACULTY, departmentId: ece.id,
      },
    });
    const fp = await prisma.facultyProfile.create({
      data: { userId: u.id, designation: f.designation },
    });
    eceFacultyProfiles.push(fp);
  }
  console.log(`  ✓ HODs: CSE, ECE  |  Faculty: ${cseFacultyData.length} CSE + ${eceFacultyData.length} ECE`);

  // ── 5. Students ──
  const studentProfiles: Awaited<ReturnType<typeof prisma.studentProfile.create>>[] = [];
  const allStudentUsers: Awaited<ReturnType<typeof prisma.user.create>>[] = [];
  const usedNames = new Set<string>();

  // CSE: 40 students (001-020 → Section A, 021-040 → Section B)
  for (let i = 1; i <= 40; i++) {
    const seq = String(i).padStart(3, "0");
    const usn = `4VP24CS${seq}`;
    const section = i <= 20 ? "A" : "B";
    const name = makeStudentName(usedNames);
    const u = await prisma.user.create({
      data: {
        usn, name, email: `${usn.toLowerCase()}@student.vcet.edu`,
        passwordHash: hash("vcet@123"), role: Role.STUDENT, departmentId: cse.id,
      },
    });
    allStudentUsers.push(u);
    const sp = await prisma.studentProfile.create({
      data: {
        userId: u.id, semester: "4", section, batch: "2024-2028",
        dateOfBirth: makeDOB(),
      },
    });
    studentProfiles.push(sp);
  }

  // ECE: 20 students (001-020 → Section A)
  for (let i = 1; i <= 20; i++) {
    const seq = String(i).padStart(3, "0");
    const usn = `4VP24EC${seq}`;
    const name = makeStudentName(usedNames);
    const u = await prisma.user.create({
      data: {
        usn, name, email: `${usn.toLowerCase()}@student.vcet.edu`,
        passwordHash: hash("vcet@123"), role: Role.STUDENT, departmentId: ece.id,
      },
    });
    allStudentUsers.push(u);
    const sp = await prisma.studentProfile.create({
      data: {
        userId: u.id, semester: "4", section: "A", batch: "2024-2028",
        dateOfBirth: makeDOB(),
      },
    });
    studentProfiles.push(sp);
  }
  console.log(`  ✓ Students: 40 CSE (A:001-020, B:021-040) + 20 ECE (A:001-020)`);

  // ── 6. Parents (1 per student) ──
  const parentPrefixes = ["Mr.", "Mrs."];
  const parentFirstM = ["Arjun","Suresh","Ramesh","Venkatesh","Krishna","Mohan",
    "Gopal","Nagaraj","Shankar","Anil","Sunil","Prakash","Harish","Vijay","Ravi"];
  const parentFirstF = ["Lakshmi","Meera","Anita","Sunita","Geetha","Shobha",
    "Rekha","Asha","Radha","Usha","Vimala","Saraswathi","Jayanthi","Rathna","Savitha"];

  let parentCount = 0;
  for (const su of allStudentUsers) {
    const parts = su.name.split(" ");
    const last = parts[parts.length - 1];
    const isMale = firstNamesM.includes(parts[0]) ? 0 : 1;
    const prefix = parentPrefixes[isMale];
    const first = pick(isMale === 0 ? parentFirstM : parentFirstF);
    const pName = `${prefix} ${first} ${last}`;
    const pUsn = `PARENT_${su.usn}`;

    const parent = await prisma.user.create({
      data: {
        usn: pUsn, name: pName, email: `${pUsn.toLowerCase()}@vcet.edu`,
        passwordHash: hash("parent@123"), role: Role.PARENT, departmentId: su.departmentId,
      },
    });
    await prisma.parentStudent.create({
      data: { parentId: parent.id, studentId: su.id },
    });
    parentCount++;
  }
  console.log(`  ✓ Parents: ${parentCount} (1 per student)`);

  // ── 7. Class Assignments (faculty → subject → section) ──
  // CSE: 5 faculty → 5 subjects → 2 sections (A, B)
  let classAssignmentCount = 0;
  for (let si = 0; si < cseSubjects.length; si++) {
    const facultyIdx = si % cseFacultyProfiles.length;
    for (const section of ["A", "B"]) {
      await prisma.classAssignment.create({
        data: {
          facultyProfileId: cseFacultyProfiles[facultyIdx].id,
          subjectId: cseSubjects[si].id,
          section, semester: "4", academicYear: "2025-2026",
          assignedByUserId: admin.id,
        },
      });
      classAssignmentCount++;
    }
  }
  // ECE: 5 faculty → 5 subjects → 1 section (A)
  for (let si = 0; si < eceSubjects.length; si++) {
    const facultyIdx = si % eceFacultyProfiles.length;
    await prisma.classAssignment.create({
      data: {
        facultyProfileId: eceFacultyProfiles[facultyIdx].id,
        subjectId: eceSubjects[si].id,
        section: "A", semester: "4", academicYear: "2025-2026",
        assignedByUserId: admin.id,
      },
    });
    classAssignmentCount++;
  }
  console.log(`  ✓ Class assignments: ${classAssignmentCount}`);

  // ── 8. Attendance Records (30 working days, ~15% absence) ──
  const allSubjects = [...cseSubjects, ...eceSubjects];
  const startDate = new Date("2025-04-01");
  const days = workingDays(30, startDate);

  let attendanceCount = 0;
  for (const sp of studentProfiles) {
    // Determine which subjects this student takes (by department)
    const isCse = sp.id <= studentProfiles[39]?.id; // First 40 are CSE
    const subjects = isCse ? cseSubjects : eceSubjects;

    for (const subj of subjects) {
      // Each subject gets ~20 class sessions over the 30 days
      const sessionDays = days.filter(() => Math.random() < 0.67);
      for (const date of sessionDays) {
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
        }).catch(() => {}); // skip duplicates
        attendanceCount++;
      }
    }
  }
  console.log(`  ✓ Attendance records: ${attendanceCount}`);

  // ── 9. VTU IA Marks (IA1 — Q1 Q2 Q3 Q4 for all students × subjects) ──
  let iaCount = 0;
  for (const sp of studentProfiles) {
    const isCse = sp.id <= studentProfiles[39]?.id;
    const subjects = isCse ? cseSubjects : eceSubjects;

    for (const subj of subjects) {
      // Realistic score ranges: Q1/Q3 ~N(16,4), Q2/Q4 ~N(17,4), capped 0-25
      const q1 = normalScore(16, 4, 5, 25);
      const q2 = normalScore(17, 4, 5, 25);
      const q3 = normalScore(16, 4, 5, 25);
      const q4 = normalScore(17, 4, 5, 25);
      const sectionA = Math.max(q1, q2);
      const sectionB = Math.max(q3, q4);
      const total = Math.min(sectionA + sectionB, 50);

      await prisma.vTUIAMark.create({
        data: {
          studentProfileId: sp.id,
          subjectId: subj.id,
          iaNumber: 1,
          q1, q2, q3, q4, sectionA, sectionB, total,
          enteredByUserId: admin.id,
        },
      });
      iaCount++;
    }
  }
  console.log(`  ✓ VTU IA marks: ${iaCount} entries (IA1, Q1-Q4 for all students × subjects)`);

  // ── 10. CIE Summaries ──
  let cieCount = 0;
  for (const sp of studentProfiles) {
    const isCse = sp.id <= studentProfiles[39]?.id;
    const subjects = isCse ? cseSubjects : eceSubjects;
    for (const subj of subjects) {
      const ia1 = await prisma.vTUIAMark.findFirst({
        where: { studentProfileId: sp.id, subjectId: subj.id, iaNumber: 1 },
      });
      const ia1Total = ia1?.total ?? 0;
      const finalCIE = Math.min(ia1Total, 50);

      await prisma.vTUCIESummary.create({
        data: {
          studentProfileId: sp.id,
          subjectId: subj.id,
          ia1Total,
          ia2Total: 0,
          ia3Total: 0,
          bestTwoTotal: ia1Total,
          finalCIE,
          isEligible: finalCIE >= 20,
          finalized: false,
        },
      });
      cieCount++;
    }
  }
  console.log(`  ✓ CIE summaries: ${cieCount}`);

  // ── 11. Counsellor Assignments (3 per department) ──
  const cseStudents = studentProfiles.slice(0, 40);
  const eceStudents = studentProfiles.slice(40);

  let counsellorCount = 0;
  // CSE: assign first 3 CSE faculty to batches of students
  for (let fi = 0; fi < 3; fi++) {
    const batchSize = Math.ceil(cseStudents.length / 3);
    const batch = cseStudents.slice(fi * batchSize, (fi + 1) * batchSize);
    const facultyUser = await prisma.user.findUnique({
      where: { usn: cseFacultyData[fi].usn },
    });
    if (!facultyUser) continue;
    for (const sp of batch) {
      const studentUser = await prisma.user.findUnique({
        where: { id: sp.userId },
      });
      if (!studentUser) continue;
      await prisma.counsellorAssignment.create({
        data: {
          facultyUserId: facultyUser.id,
          studentUserId: studentUser.id,
          departmentId: cse.id,
          academicYear: "2025-2026",
          isActive: true,
          assignedById: hodCseUser.id,
        },
      });
      counsellorCount++;
    }
  }
  // ECE: assign first 3 ECE faculty
  for (let fi = 0; fi < 3; fi++) {
    const batchSize = Math.ceil(eceStudents.length / 3);
    const batch = eceStudents.slice(fi * batchSize, (fi + 1) * batchSize);
    const facultyUser = await prisma.user.findUnique({
      where: { usn: eceFacultyData[fi].usn },
    });
    if (!facultyUser) continue;
    for (const sp of batch) {
      const studentUser = await prisma.user.findUnique({
        where: { id: sp.userId },
      });
      if (!studentUser) continue;
      await prisma.counsellorAssignment.create({
        data: {
          facultyUserId: facultyUser.id,
          studentUserId: studentUser.id,
          departmentId: ece.id,
          academicYear: "2025-2026",
          isActive: true,
          assignedById: hodEceUser.id,
        },
      });
      counsellorCount++;
    }
  }
  console.log(`  ✓ Counsellor assignments: ${counsellorCount}`);

  // ── 12. Notices ──
  const notices = [
    { title: "📝 IA1 Results Published", content: "Internal Assessment 1 results have been published. Check your marks on the student portal. Concerns to be raised within 7 days.", targetRole: Role.STUDENT },
    { title: "⚠️ Attendance Shortage Notice", content: "Students with attendance below 75% must submit medical certificates to their HOD by June 10, 2025. Defaulters will be detained from semester exams.", targetRole: Role.STUDENT },
    { title: "📅 Parent-Teacher Meeting", content: "PTM for Semester 4 students will be held on June 15, 2025 at 10:00 AM in the main auditorium. Parents of students with attendance below 70% are requested to meet faculty personally.", targetRole: Role.PARENT },
    { title: "📋 Faculty — CIE Submission Deadline", content: "All faculty members must submit CIE marks for the current semester by June 5, 2025. Department coordinators will review the entries.", targetRole: Role.FACULTY },
    { title: "🏛️ College Foundation Day", content: "VCET Foundation Day celebration on May 28, 2025. Chief Guest: Dr. K. N. Subramanya. All students and staff must attend.", targetRole: null },
  ];
  for (const n of notices) {
    await prisma.notice.create({
      data: { ...n, postedByUserId: admin.id, isActive: true, departmentId: cse.id },
    });
  }
  console.log(`  ✓ Notices: ${notices.length}`);

  // ── 13. Academic Calendar ──
  const calendar = [
    { title: "Semester Start", description: "Odd Semester 2025-2026 begins", startDate: new Date("2025-04-01"), endDate: null, type: "term" },
    { title: "IA1 Examinations", description: "Internal Assessment 1 for all subjects", startDate: new Date("2025-04-28"), endDate: new Date("2025-05-03"), type: "exam" },
    { title: "IA2 Examinations", description: "Internal Assessment 2 for all subjects", startDate: new Date("2025-06-02"), endDate: new Date("2025-06-07"), type: "exam" },
    { title: "Semester End Practical Exams", description: "Practical examinations for all courses", startDate: new Date("2025-06-16"), endDate: new Date("2025-06-25"), type: "exam" },
    { title: "Semester Break", description: "Summer break", startDate: new Date("2025-06-26"), endDate: new Date("2025-07-15"), type: "holiday" },
  ];
  for (const c of calendar) {
    await prisma.academicCalendar.create({ data: c });
  }
  console.log(`  ✓ Academic calendar: ${calendar.length} entries`);

  // ── Summary ──
  console.log("\n✅ Seeding complete!");
  console.log(`   Departments: 2 (CSE, ECE)`);
  console.log(`   Subjects: ${cseSubjects.length + eceSubjects.length} (Semester 4)`);
  console.log(`   Students: ${studentProfiles.length} (CSE:40 + ECE:20)`);
  console.log(`   Parents: ${parentCount}`);
  console.log(`   Faculty: ${cseFacultyProfiles.length + eceFacultyProfiles.length + 2} (incl. HODs)`);
  console.log(`   Attendance: ${attendanceCount} records (~15% absence)`);
  console.log(`   VTU IA: ${iaCount} entries (IA1 Q1-Q4 for all)`);
  console.log(`   Counselling: ${counsellorCount} assignments`);
  console.log(`   Notices: ${notices.length}`);
  console.log(`\n   🔑 CSE Student: 4VP24CS001 / vcet@123`);
  console.log(`   🔑 ECE Student: 4VP24EC001 / vcet@123`);
  console.log(`   🔑 Faculty: FAC_CSE_001 / faculty@123`);
  console.log(`   🔑 HOD: HOD_CSE / hod@123`);
  console.log(`   🔑 Admin: ADMIN001 / admin@123`);
  console.log(`   🔑 Principal: PRINCIPAL / principal@123`);
  console.log(`   🔑 Parent: PARENT_4VP24CS001 / parent@123`);
}

main()
  .catch((e) => { console.error("❌ Seed failed:", e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
