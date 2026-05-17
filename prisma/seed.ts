import { PrismaClient, Role, AttendanceStatus } from "@prisma/client";
import bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  const dept = await prisma.department.upsert({
    where: { code: "CSE" },
    update: {},
    create: { name: "Computer Science & Engineering", code: "CSE" },
  });

  const subjectData = [
    { code: "21CS51", name: "Management & Entrepreneurship for IT", credits: 3 },
    { code: "21CS52", name: "Computer Networks & Security", credits: 4 },
    { code: "21CS53", name: "Database Management System", credits: 4 },
    { code: "21CS54", name: "Design Patterns", credits: 3 },
    { code: "21CS55", name: "Automata Theory & Compiler Design", credits: 4 },
    { code: "21CS56", name: "Full Stack Development", credits: 3 },
    { code: "21CS57", name: "Operating Systems", credits: 4 },
    { code: "21CS58", name: "Software Engineering", credits: 3 },
  ];

  const subjects: Awaited<ReturnType<typeof prisma.subject.create>>[] = [];
  for (const s of subjectData) {
    const sub = await prisma.subject.upsert({
      where: { code: s.code },
      update: {},
      create: { ...s, semester: "5", departmentId: dept.id },
    });
    subjects.push(sub);
  }

  const adminPassword = await bcrypt.hash("admin123", 10);
  const facultyPassword = await bcrypt.hash("faculty123", 10);
  const studentPassword = await bcrypt.hash("student123", 10);
  const parentPassword = await bcrypt.hash("parent123", 10);
  const hodPassword = await bcrypt.hash("hod123", 10);

  const admin = await prisma.user.upsert({
    where: { usn: "ADMIN001" },
    update: {},
    create: { usn: "ADMIN001", name: "System Admin", email: "admin@vcet.edu", passwordHash: adminPassword, role: Role.ADMIN, departmentId: dept.id },
  });

  const hod = await prisma.user.upsert({
    where: { usn: "HOD001" },
    update: {},
    create: { usn: "HOD001", name: "Dr. Rajesh Kumar", email: "hod.cse@vcet.edu", passwordHash: hodPassword, role: Role.HOD, departmentId: dept.id },
  });

  const principal = await prisma.user.upsert({
    where: { usn: "PRINCIPAL001" },
    update: {},
    create: { usn: "PRINCIPAL001", name: "Dr. Venkatesh Prasad", email: "principal@vcet.edu", passwordHash: await bcrypt.hash("principal123", 10), role: Role.PRINCIPAL, departmentId: dept.id },
  });

  const facultyNames = [
    { name: "Prof. Anil Kumar", email: "anil@vcet.edu", designation: "Assistant Professor" },
    { name: "Prof. Sunita Rao", email: "sunita@vcet.edu", designation: "Associate Professor" },
    { name: "Prof. Vikram Singh", email: "vikram@vcet.edu", designation: "Assistant Professor" },
    { name: "Prof. Priya Sharma", email: "priya@vcet.edu", designation: "Assistant Professor" },
    { name: "Prof. Krishna Murthy", email: "krishna@vcet.edu", designation: "Professor" },
  ];

  const facultyProfiles: Awaited<ReturnType<typeof prisma.facultyProfile.create>>[] = [];
  for (let i = 0; i < facultyNames.length; i++) {
    const user = await prisma.user.upsert({
      where: { usn: `FAC${String(i + 1).padStart(3, "0")}` },
      update: {},
      create: { usn: `FAC${String(i + 1).padStart(3, "0")}`, name: facultyNames[i].name, email: facultyNames[i].email, passwordHash: facultyPassword, role: Role.FACULTY, departmentId: dept.id },
    });
    const fp = await prisma.facultyProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, designation: facultyNames[i].designation },
    });
    facultyProfiles.push(fp);
  }

  const studentNames = [
    "Arjun Patel", "Ananya Reddy", "Bhavesh Shah", "Charvi Jain", "Dev Patel",
    "Eshwar Naik", "Fathima Khan", "Ganesh Bhat", "Harshini Devi", "Ishaan Chatterjee",
    "Jashwanth Rao", "Kavya Singh", "Lakshmi Nair", "Madhav Iyer", "Nisha Gupta",
    "Omkar Desai", "Pooja Verma", "Qureshi Ansari", "Rohan Pillai", "Sneha Kumari",
    "Tarun Raj", "Uma Krishnan", "Vijay Kumar", "Wafa Fatima", "Xavier Dsouza",
    "Yashoda Devi", "Zaid Ahmed", "Anushka Sen", "Bala Murthy", "Chitra Devi",
    "Dinesh Yadav", "Elakiya Ram", "Farhan Khan", "Gopal Krishna", "Harini Venkat",
    "Ibrahim Shaik", "Jaya Prakash", "Kamala Devi", "Lakshman Rao", "Meenakshi Sundaram",
  ];

  const studentProfiles: Awaited<ReturnType<typeof prisma.studentProfile.create>>[] = [];
  for (let i = 0; i < 40; i++) {
    const usn = `1VE21CS${String(i + 1).padStart(3, "0")}`;
    const section = i < 20 ? "A" : "B";
    const user = await prisma.user.upsert({
      where: { usn },
      update: {},
      create: { usn, name: studentNames[i], email: `${usn.toLowerCase()}@vcet.edu`, passwordHash: studentPassword, role: Role.STUDENT, departmentId: dept.id },
    });
    const sp = await prisma.studentProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: { userId: user.id, semester: "5", section, batch: "2021-2025" },
    });
    studentProfiles.push(sp);
  }

  for (let i = 0; i < 10; i++) {
    const parentUSN = `PAR${String(i + 1).padStart(3, "0")}`;
    const parentName = `${studentNames[i].split(" ")[0]} Parent`;
    const parent = await prisma.user.upsert({
      where: { usn: parentUSN },
      update: {},
      create: { usn: parentUSN, name: parentName, email: `${parentUSN.toLowerCase()}@vcet.edu`, passwordHash: parentPassword, role: Role.PARENT, departmentId: dept.id },
    });
    await prisma.parentStudent.upsert({
      where: { parentId_studentId: { parentId: parent.id, studentId: studentProfiles[i].userId } },
      update: {},
      create: { parentId: parent.id, studentId: studentProfiles[i].userId },
    });
  }

  for (let s = 0; s < subjects.length; s++) {
    await prisma.classAssignment.upsert({
      where: { subjectId_section_academicYear: { subjectId: subjects[s].id, section: "A", academicYear: "2024-2025" } },
      update: {},
      create: { facultyProfileId: facultyProfiles[s % facultyProfiles.length].id, subjectId: subjects[s].id, section: "A", semester: "5", academicYear: "2024-2025", assignedByUserId: admin.id },
    });
    await prisma.classAssignment.upsert({
      where: { subjectId_section_academicYear: { subjectId: subjects[s].id, section: "B", academicYear: "2024-2025" } },
      update: {},
      create: { facultyProfileId: facultyProfiles[(s + 1) % facultyProfiles.length].id, subjectId: subjects[s].id, section: "B", semester: "5", academicYear: "2024-2025", assignedByUserId: admin.id },
    });
  }

  const startDate = new Date("2024-11-01");
  for (let day = 0; day < 30; day++) {
    const date = new Date(startDate);
    date.setDate(date.getDate() + day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;
    const subjectIdx = day % subjects.length;
    const subj = subjects[subjectIdx];
    for (const sp of studentProfiles) {
      const section = sp.section;
      const rand = Math.random();
      let status: AttendanceStatus;
      if (rand < 0.12) status = AttendanceStatus.ABSENT;
      else if (rand < 0.17) status = AttendanceStatus.OD;
      else status = AttendanceStatus.PRESENT;
      try {
        await prisma.attendanceRecord.create({
          data: {
            studentProfileId: sp.id,
            subjectId: subj.id,
            date,
            status,
            markedByUserId: admin.id,
          },
        }).catch(() => {});
      } catch {}
    }
  }

  for (const sp of studentProfiles) {
    for (const subj of subjects) {
      const marks = 18 + Math.floor(Math.random() * 12);
      await prisma.iAMark.upsert({
        where: { studentProfileId_subjectId_iaNumber: { studentProfileId: sp.id, subjectId: subj.id, iaNumber: 1 } },
        update: {},
        create: { studentProfileId: sp.id, subjectId: subj.id, iaNumber: 1, marksObtained: marks, maxMarks: 30, enteredByUserId: admin.id },
      });
    }
  }

  const noticesData = [
    { title: "IA2 Examination Schedule", content: "Internal Assessment 2 will be conducted from December 2-7, 2024. All students must carry their college ID cards.", targetRole: Role.STUDENT as Role | null },
    { title: "Lab Manual Submission Deadline", content: "All lab manuals for semester 5 must be submitted by November 30, 2024. Late submissions will not be accepted.", targetRole: Role.STUDENT as Role | null },
    { title: "Parent-Teacher Meeting", content: "PTM for semester 5 students will be held on December 15, 2024 at 10:00 AM in the main auditorium.", targetRole: Role.PARENT as Role | null },
    { title: "Faculty Meeting - Research Proposals", content: "All faculty members must submit their research proposals for the upcoming semester by December 1, 2024.", targetRole: Role.FACULTY as Role | null },
    { title: "Holiday Notice", content: "College will remain closed on November 14 (Second Saturday) and November 15 (Sunday) for general holidays.", targetRole: null },
  ];
  for (const n of noticesData) {
    await prisma.notice.create({
      data: { ...n, postedByUserId: admin.id, isActive: true, departmentId: dept.id },
    });
  }

  const calendarData = [
    { title: "IA1 Results Declaration", description: "IA1 results will be declared on the student portal", startDate: new Date("2024-11-20"), endDate: new Date("2024-11-20"), type: "exam" },
    { title: "CIA Test", description: "Course Outcome Assessment test for all semesters", startDate: new Date("2024-11-25"), endDate: new Date("2024-11-27"), type: "exam" },
    { title: "Semester End Practical Exams", description: "Practical examinations for all courses", startDate: new Date("2024-12-10"), endDate: new Date("2024-12-20"), type: "exam" },
    { title: "Semester Break", description: "Winter semester break for all students", startDate: new Date("2024-12-21"), endDate: new Date("2025-01-05"), type: "holiday" },
  ];
  for (const c of calendarData) {
    await prisma.academicCalendar.create({ data: c });
  }

  console.log("Seeding complete.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });