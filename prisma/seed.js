"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const client_1 = require("@prisma/client");
const bcrypt_1 = __importDefault(require("bcrypt"));
const prisma = new client_1.PrismaClient();
const SALT_ROUNDS = 10;
// ── helpers ──────────────────────────────────────────────────────────────────
function workingDays(daysBack) {
    const dates = [];
    const today = new Date();
    let checked = 0;
    while (dates.length < daysBack) {
        checked++;
        const d = new Date(today);
        d.setDate(today.getDate() - checked);
        const day = d.getDay();
        if (day !== 0 && day !== 6)
            dates.push(d);
    }
    return dates.reverse();
}
function randomMark(min, max) {
    return parseFloat((Math.random() * (max - min) + min).toFixed(1));
}
// ── main ─────────────────────────────────────────────────────────────────────
async function main() {
    console.log('🌱 Seeding VCET AMS database...');
    // clear in dependency order
    await prisma.cIEMark.deleteMany();
    await prisma.attendanceRecord.deleteMany();
    await prisma.subjectMapping.deleteMany();
    await prisma.subject.deleteMany();
    await prisma.parentStudent.deleteMany();
    await prisma.studentProfile.deleteMany();
    await prisma.facultyProfile.deleteMany();
    await prisma.refreshToken.deleteMany();
    await prisma.notice.deleteMany();
    await prisma.academicCalendar.deleteMany();
    await prisma.user.deleteMany();
    await prisma.department.deleteMany();
    console.log('  ✓ Cleared existing data');
    // ── Department ──────────────────────────────────────────────────────────────
    const cseDept = await prisma.department.create({
        data: { name: 'Computer Science & Engineering', code: 'CSE' },
    });
    const iseDept = await prisma.department.create({
        data: { name: 'Information Science & Engineering', code: 'ISE' },
    });
    console.log('  ✓ Departments created');
    // ── Passwords ───────────────────────────────────────────────────────────────
    const [studentHash, facultyHash, parentHash, hodHash, principalHash] = await Promise.all([
        bcrypt_1.default.hash('student123', SALT_ROUNDS),
        bcrypt_1.default.hash('faculty123', SALT_ROUNDS),
        bcrypt_1.default.hash('parent123', SALT_ROUNDS),
        bcrypt_1.default.hash('hod123', SALT_ROUNDS),
        bcrypt_1.default.hash('principal123', SALT_ROUNDS),
    ]);
    // ── Principal ───────────────────────────────────────────────────────────────
    await prisma.user.create({
        data: {
            usn: 'PRINCIPAL01',
            name: 'Dr. K. Narasimha Murthy',
            email: 'principal@vcet.ac.in',
            passwordHash: principalHash,
            role: client_1.Role.PRINCIPAL,
        },
    });
    // ── HoDs ────────────────────────────────────────────────────────────────────
    const cseHod = await prisma.user.create({
        data: {
            usn: 'HOD_CSE01',
            name: 'Dr. Shobha G',
            email: 'hod.cse@vcet.ac.in',
            passwordHash: hodHash,
            role: client_1.Role.HOD,
            departmentId: cseDept.id,
        },
    });
    await prisma.user.create({
        data: {
            usn: 'HOD_ISE01',
            name: 'Dr. Venkatesh B R',
            email: 'hod.ise@vcet.ac.in',
            passwordHash: hodHash,
            role: client_1.Role.HOD,
            departmentId: iseDept.id,
        },
    });
    console.log('  ✓ HoD & Principal created');
    // ── Faculty ─────────────────────────────────────────────────────────────────
    const facultyData = [
        { usn: 'FAC_CSE01', name: 'Prof. Ramesh Kumar B', email: 'ramesh@vcet.ac.in' },
        { usn: 'FAC_CSE02', name: 'Dr. Anitha S', email: 'anitha@vcet.ac.in' },
        { usn: 'FAC_CSE03', name: 'Prof. Suresh Babu H', email: 'suresh@vcet.ac.in' },
        { usn: 'FAC_CSE04', name: 'Prof. Kavitha R', email: 'kavitha@vcet.ac.in' },
        { usn: 'FAC_CSE05', name: 'Dr. Manjunath C', email: 'manjunath@vcet.ac.in' },
    ];
    const facultyUsers = [];
    for (const f of facultyData) {
        const user = await prisma.user.create({
            data: {
                usn: f.usn,
                name: f.name,
                email: f.email,
                passwordHash: facultyHash,
                role: client_1.Role.FACULTY,
                departmentId: cseDept.id,
                facultyProfile: { create: { designation: 'Assistant Professor' } },
            },
            include: { facultyProfile: true },
        });
        facultyUsers.push({ id: user.id, profileId: user.facultyProfile.id });
    }
    console.log('  ✓ Faculty created');
    // ── Subjects ─────────────────────────────────────────────────────────────────
    const subjectData = [
        { code: '21CS51', name: 'Software Engineering', credits: 3 },
        { code: '21CS52', name: 'Database Management Systems', credits: 4 },
        { code: '21CS53', name: 'Computer Networks', credits: 4 },
        { code: '21CS54', name: 'Automata Theory & Computability', credits: 3 },
        { code: '21CS55', name: 'Operating Systems', credits: 4 },
        { code: '21CS56', name: 'Object Oriented Programming with Java', credits: 3 },
        { code: '21CSMP57', name: 'DBMS Lab', credits: 2 },
        { code: '21CSMP58', name: 'Networks Lab', credits: 2 },
    ];
    const subjects = await Promise.all(subjectData.map((s) => prisma.subject.create({
        data: { ...s, semester: 'SEM5', departmentId: cseDept.id },
    })));
    console.log('  ✓ Subjects created');
    // ── Subject Mappings ─────────────────────────────────────────────────────────
    // Faculty assignments: fac[0]=21CS51+21CS52 A, fac[1]=21CS51+21CS52 B,
    //                      fac[2]=21CS53+21CS54, fac[3]=21CS55+21CS56, fac[4]=labs
    const mappings = [
        { fi: 0, si: 0, section: 'A' }, { fi: 0, si: 1, section: 'A' },
        { fi: 1, si: 0, section: 'B' }, { fi: 1, si: 1, section: 'B' },
        { fi: 2, si: 2, section: 'A' }, { fi: 2, si: 2, section: 'B' },
        { fi: 2, si: 3, section: 'A' }, { fi: 2, si: 3, section: 'B' },
        { fi: 3, si: 4, section: 'A' }, { fi: 3, si: 4, section: 'B' },
        { fi: 3, si: 5, section: 'A' }, { fi: 3, si: 5, section: 'B' },
        { fi: 4, si: 6, section: 'A' }, { fi: 4, si: 6, section: 'B' },
        { fi: 4, si: 7, section: 'A' }, { fi: 4, si: 7, section: 'B' },
    ];
    for (const m of mappings) {
        await prisma.subjectMapping.upsert({
            where: {
                subjectId_section_academicYear: {
                    subjectId: subjects[m.si].id,
                    section: m.section,
                    academicYear: '2024-25',
                },
            },
            update: {},
            create: {
                subjectId: subjects[m.si].id,
                facultyProfileId: facultyUsers[m.fi].profileId,
                section: m.section,
                academicYear: '2024-25',
            },
        });
    }
    console.log('  ✓ Subject mappings created');
    // ── Students ─────────────────────────────────────────────────────────────────
    const studentNames = [
        'Aditya Kumar Sharma', 'Bhavana Reddy', 'Chetan Naik', 'Deepa Kulkarni',
        'Eshwar Prasad M', 'Fathima Begum', 'Ganesh Bhat', 'Harini Suresh',
        'Irfan Ahmed', 'Jayanthi Krishnan', 'Karthik Hegde', 'Lavanya Shetty',
        'Manoj Patil', 'Nandita Rao', 'Omkar Desai', 'Pavithra Nair',
        'Qasim Ali', 'Rashmi Kulkarni', 'Sanjay Gowda', 'Tejas Iyer',
        'Uma Shankar', 'Vaishali Joshi', 'Wasim Khan', 'Xena D Souza',
        'Yogesh Kamath', 'Aarti Bhatt', 'Bhaskar Rao', 'Chandra Shekar',
        'Divya Murthy', 'Eknath Patil', 'Farah Sheikh', 'Gowri Shankar',
        'Hemant Jain', 'Indira Devi', 'Jagadish Kumar', 'Kavya Menon',
        'Lokesh Verma', 'Madhu Sudhan', 'Nithya Lakshmi', 'Prashanth G',
    ];
    const studentProfiles = [];
    for (let i = 0; i < 40; i++) {
        const usn = `1VE21CS${String(i + 1).padStart(3, '0')}`;
        const section = i < 20 ? 'A' : 'B';
        const user = await prisma.user.create({
            data: {
                usn,
                name: studentNames[i],
                passwordHash: studentHash,
                role: client_1.Role.STUDENT,
                departmentId: cseDept.id,
                studentProfile: {
                    create: { semester: 'SEM5', section, batch: '2021-2025' },
                },
            },
            include: { studentProfile: true },
        });
        studentProfiles.push({
            profileId: user.studentProfile.id,
            userId: user.id,
            usn,
            section,
        });
    }
    console.log('  ✓ Students created (40)');
    // ── Parents ──────────────────────────────────────────────────────────────────
    for (let i = 0; i < 10; i++) {
        const parentUser = await prisma.user.create({
            data: {
                usn: `PAR${String(i + 1).padStart(3, '0')}`,
                name: `Parent of ${studentNames[i].split(' ')[0]}`,
                passwordHash: parentHash,
                role: client_1.Role.PARENT,
            },
        });
        await prisma.parentStudent.create({
            data: { parentId: parentUser.id, studentId: studentProfiles[i].userId },
        });
    }
    console.log('  ✓ Parents created (10)');
    // ── Attendance Records ────────────────────────────────────────────────────────
    const dates = workingDays(30);
    const attendanceRecords = [];
    for (const sp of studentProfiles) {
        // subjects depend on section
        const sectionSubjects = subjects.filter((_, idx) => {
            // all 8 subjects apply to both sections
            return true;
        });
        // each student has ~15% absence rate
        const absenceIndices = new Set();
        const absenceCount = Math.floor(dates.length * 0.15);
        while (absenceIndices.size < absenceCount) {
            absenceIndices.add(Math.floor(Math.random() * dates.length));
        }
        for (const subject of sectionSubjects) {
            // get faculty for this subject+section
            const mapping = mappings.find((m) => subjects[m.si].id === subject.id && m.section === sp.section);
            const facultyUserId = mapping
                ? facultyUsers[mapping.fi].id
                : facultyUsers[0].id;
            for (let di = 0; di < dates.length; di++) {
                // labs only 3 days a week
                if ([6, 7].includes(subjects.indexOf(subject))) {
                    const dateDay = dates[di].getDay();
                    if (dateDay !== 2 && dateDay !== 4)
                        continue;
                }
                attendanceRecords.push({
                    studentProfileId: sp.profileId,
                    subjectId: subject.id,
                    date: dates[di],
                    status: absenceIndices.has(di)
                        ? client_1.AttendanceStatus.ABSENT
                        : client_1.AttendanceStatus.PRESENT,
                    markedByUserId: facultyUserId,
                });
            }
        }
    }
    // batch insert in chunks of 500
    for (let i = 0; i < attendanceRecords.length; i += 500) {
        await prisma.attendanceRecord.createMany({
            data: attendanceRecords.slice(i, i + 500),
            skipDuplicates: true,
        });
    }
    console.log(`  ✓ Attendance records created (${attendanceRecords.length})`);
    // ── CIE Marks ────────────────────────────────────────────────────────────────
    const marksData = [];
    for (const sp of studentProfiles) {
        for (const subject of subjects) {
            const mapping = mappings.find((m) => subjects[m.si].id === subject.id && m.section === sp.section);
            const facultyUserId = mapping
                ? facultyUsers[mapping.fi].id
                : facultyUsers[0].id;
            // CIE1 for all, CIE2 for 70%, CIE3 for 40%
            for (let cie = 1; cie <= 3; cie++) {
                if (cie === 2 && Math.random() > 0.7)
                    continue;
                if (cie === 3 && Math.random() > 0.4)
                    continue;
                marksData.push({
                    studentProfileId: sp.profileId,
                    subjectId: subject.id,
                    cieNumber: cie,
                    marksObtained: randomMark(20, 49),
                    maxMarks: 50,
                    enteredByUserId: facultyUserId,
                });
            }
        }
    }
    for (let i = 0; i < marksData.length; i += 500) {
        await prisma.cIEMark.createMany({
            data: marksData.slice(i, i + 500),
            skipDuplicates: true,
        });
    }
    console.log(`  ✓ CIE marks created (${marksData.length})`);
    // ── Notices ───────────────────────────────────────────────────────────────────
    await prisma.notice.createMany({
        data: [
            {
                title: 'CIE-2 Examination Schedule',
                content: 'CIE-2 examinations for 5th semester will be conducted from 15th to 22nd of this month. Students are advised to prepare accordingly. Timetable will be displayed on the notice board.',
                targetRole: null,
                departmentId: null,
                postedByUserId: cseHod.id,
                isActive: true,
            },
            {
                title: 'Attendance Shortage Warning',
                content: 'Students with attendance below 75% in any subject will not be permitted to appear for the end-semester examination. Please regularize your attendance immediately.',
                targetRole: client_1.Role.STUDENT,
                departmentId: cseDept.id,
                postedByUserId: cseHod.id,
                isActive: true,
            },
            {
                title: 'Industrial Visit to Infosys Mysuru',
                content: 'An industrial visit has been arranged to Infosys Mysuru campus on 28th of this month. Interested students from CSE 5th semester may register with their class representatives by this Friday.',
                targetRole: null,
                departmentId: cseDept.id,
                postedByUserId: cseHod.id,
                isActive: true,
            },
            {
                title: 'Faculty Development Programme',
                content: 'A 3-day Faculty Development Programme on "AI/ML Applications in Education" is scheduled next week. All faculty members are requested to register on the college portal.',
                targetRole: client_1.Role.FACULTY,
                departmentId: null,
                postedByUserId: cseHod.id,
                isActive: true,
            },
            {
                title: 'Republic Day Holiday',
                content: 'The college will remain closed on 26th January on account of Republic Day. Regular classes will resume from 27th January.',
                targetRole: null,
                departmentId: null,
                postedByUserId: cseHod.id,
                isActive: true,
            },
        ],
    });
    console.log('  ✓ Notices created');
    // ── Academic Calendar ─────────────────────────────────────────────────────────
    const now = new Date();
    await prisma.academicCalendar.createMany({
        data: [
            {
                title: 'CIE-2 Examinations',
                description: '5th & 6th semester CIE-2',
                startDate: new Date(now.getFullYear(), now.getMonth(), 15),
                endDate: new Date(now.getFullYear(), now.getMonth(), 22),
                type: 'EXAM',
            },
            {
                title: 'Republic Day',
                description: 'National Holiday',
                startDate: new Date(now.getFullYear(), 0, 26),
                type: 'HOLIDAY',
            },
            {
                title: 'Technical Fest – TechVCET',
                description: 'Annual technical festival',
                startDate: new Date(now.getFullYear(), now.getMonth() + 1, 10),
                endDate: new Date(now.getFullYear(), now.getMonth() + 1, 12),
                type: 'EVENT',
            },
            {
                title: 'Semester End Examinations',
                description: 'VTU semester-end exams begin',
                startDate: new Date(now.getFullYear(), now.getMonth() + 2, 1),
                type: 'EXAM',
            },
        ],
    });
    console.log('  ✓ Academic calendar created');
    console.log('\n✅ Seeding complete!');
    console.log('\nLogin credentials:');
    console.log('  Student:   USN 1VE21CS001  | pass: student123');
    console.log('  Faculty:   USN FAC_CSE01   | pass: faculty123');
    console.log('  HoD:       USN HOD_CSE01   | pass: hod123');
    console.log('  Principal: USN PRINCIPAL01 | pass: principal123');
    console.log('  Parent:    USN PAR001       | pass: parent123');
}
main()
    .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
})
    .finally(() => prisma.$disconnect());
//# sourceMappingURL=seed.js.map