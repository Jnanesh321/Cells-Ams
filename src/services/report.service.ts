import PDFDocument from "pdfkit";
import { getDeptMarksForHoD } from "./marks.service";

type StudentRow = {
  user: { usn: string; name: string };
  semester: string;
  section: string;
  iaMarks: Array<{ iaNumber: number; marksObtained: number; subject: { code: string; name: string } }>;
};

type AggregatedMark = {
  subject: string;
  ia1?: number;
  ia2?: number;
  ia3?: number;
};

type AggregatedStudent = {
  user: { usn: string; name: string };
  semester: string;
  section: string;
  marks: AggregatedMark[];
};

function aggregateStudentMarks(student: StudentRow): AggregatedStudent {
  const bySubject = new Map<string, AggregatedMark>();

  for (const m of student.iaMarks) {
    const key = m.subject.code;
    const row = bySubject.get(key) ?? { subject: m.subject.code };

    if (m.iaNumber === 1) row.ia1 = m.marksObtained;
    if (m.iaNumber === 2) row.ia2 = m.marksObtained;
    if (m.iaNumber === 3) row.ia3 = m.marksObtained;

    bySubject.set(key, row);
  }

  return {
    user: student.user,
    semester: student.semester,
    section: student.section,
    marks: Array.from(bySubject.values()),
  };
}

export async function generateStudentReportPDF(studentUsn: string, deptId: number): Promise<Buffer> {
  const allStudents = await getDeptMarksForHoD(deptId);
  const student = allStudents.find((s) => s.user.usn === studentUsn);

  if (!student) {
    throw Object.assign(new Error("Student not found in department"), { status: 404 });
  }

  return buildPDF([aggregateStudentMarks(student as StudentRow)], `IA Marks Report - ${student.user.name}`);
}

export async function generateClassReportPDF(
  deptId: number,
  section: string,
  semester: string
): Promise<Buffer> {
  const allStudents = await getDeptMarksForHoD(deptId);

  const filtered = allStudents
    .filter((s) => s.section === section && s.semester === semester)
    .map((s) => aggregateStudentMarks(s as StudentRow));

  return buildPDF(filtered, `IA Marks - ${semester} Section ${section}`);
}

function buildPDF(students: AggregatedStudent[], title: string): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: "A4" });
    const buffers: Buffer[] = [];

    doc.on("data", (b: Buffer) => buffers.push(b));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    doc.fontSize(16).font("Helvetica-Bold").text("Vivekananda College of Engineering & Technology", { align: "center" });
    doc.fontSize(11).font("Helvetica").text(title, { align: "center" });
    doc.moveDown();
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.5);

    const cols = { usn: 40, name: 130, sub: 310, ia1: 390, ia2: 430, ia3: 470, tot: 515 };
    doc.fontSize(9).font("Helvetica-Bold");
    doc.text("USN", cols.usn, doc.y);
    doc.text("Name", cols.name, doc.y - doc.currentLineHeight());
    doc.text("Subject", cols.sub, doc.y - doc.currentLineHeight());
    doc.text("IA1", cols.ia1, doc.y - doc.currentLineHeight());
    doc.text("IA2", cols.ia2, doc.y - doc.currentLineHeight());
    doc.text("IA3", cols.ia3, doc.y - doc.currentLineHeight());
    doc.text("Total", cols.tot, doc.y - doc.currentLineHeight());
    doc.moveDown(0.3);
    doc.moveTo(40, doc.y).lineTo(555, doc.y).stroke();
    doc.moveDown(0.3);
    doc.font("Helvetica").fontSize(8);

    for (const student of students) {
      const marks = student.marks.length > 0 ? student.marks : [{ subject: "-" }];
      const firstY = doc.y;

      marks.forEach((m, i) => {
        const y = firstY + i * 14;
        if (i === 0) {
          doc.text(student.user.usn, cols.usn, y);
          doc.text(student.user.name.substring(0, 22), cols.name, y);
        }

        doc.text(m.subject, cols.sub, y);
        doc.text(m.ia1 != null ? String(m.ia1) : "-", cols.ia1, y);
        doc.text(m.ia2 != null ? String(m.ia2) : "-", cols.ia2, y);
        doc.text(m.ia3 != null ? String(m.ia3) : "-", cols.ia3, y);

        const values = [m.ia1, m.ia2, m.ia3].filter((v): v is number => typeof v === "number");
        const total = values.reduce((a, b) => a + b, 0);
        doc.text(String(total), cols.tot, y);
      });

      doc.y = firstY + marks.length * 14 + 4;
      if (doc.y > 720) doc.addPage();
    }

    doc.end();
  });
}
