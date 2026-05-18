function getBestTwoAverage(ia1?: number | null, ia2?: number | null, ia3?: number | null): number {
  const vals = [ia1, ia2, ia3].filter((v): v is number => v != null && v >= 0).sort((a, b) => b - a);
  const bestTwo = vals.slice(0, 2);
  if (bestTwo.length === 0) return 0;
  return bestTwo.reduce((s, v) => s + v, 0) / bestTwo.length;
}

function formatDate(): string {
  const d = new Date();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const COLLEGE_HEADER = `
  <div style="text-align:center; border-bottom:2px solid #1a237e; padding-bottom:10px; margin-bottom:20px;">
    <h1 style="color:#1a237e; margin:0; font-size:18px;">VIVEKANANDA COLLEGE OF ENGINEERING AND TECHNOLOGY, PUTTUR</h1>
    <p style="color:#555; margin:4px 0 0; font-size:12px;">(Affiliated to Visvesvaraya Technological University, Belagavi)</p>
    <p style="color:#555; margin:2px 0 0; font-size:11px;">Approved by AICTE, New Delhi | Accredited by NBA</p>
  </div>`;

const BASE_STYLES = `
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; margin: 20mm; color: #333; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #999; padding: 6px 8px; text-align: left; font-size: 11px; }
    th { background: #1a237e; color: #fff; font-weight: 600; }
    tr:nth-child(even) { background: #f5f5f5; }
    .red-bg { background: #ffebee !important; }
    .red-text { color: #c62828 !important; font-weight: bold; }
    .footer { text-align: center; margin-top: 30px; font-size: 10px; color: #888; border-top: 1px solid #ccc; padding-top: 8px; }
    .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; font-weight: bold; }
    .badge-red { background: #ffebee; color: #c62828; }
    .badge-green { background: #e8f5e9; color: #2e7d32; }
    .badge-amber { background: #fff8e1; color: #f57f17; }
    .signature { margin-top: 40px; display: flex; justify-content: space-between; }
    .signature div { width: 45%; }
    .signature p { margin: 2px 0; }
  </style>`;

export function generateStudentReportHTML(data: {
  studentName: string;
  usn: string;
  department: string;
  semester: number;
  section: string;
  subjects: Array<{
    code: string;
    name: string;
    faculty: string;
    present: number;
    total: number;
    percentage: number;
    ia1?: number | null;
    ia2?: number | null;
    ia3?: number | null;
  }>;
}): string {
  const rows = data.subjects.map((s) => {
    const avg = getBestTwoAverage(s.ia1, s.ia2, s.ia3);
    const attRisk = s.percentage < 75;
    const marksRisk = avg < 14;
    const riskClass = attRisk || marksRisk ? 'red-bg' : '';
    return `
      <tr class="${riskClass}">
        <td>${s.code}</td>
        <td>${s.name}</td>
        <td>${s.faculty}</td>
        <td class="${attRisk ? 'red-text' : ''}">${s.present}/${s.total} (${s.percentage.toFixed(1)}%)</td>
        <td>${s.ia1 ?? '-'}</td>
        <td>${s.ia2 ?? '-'}</td>
        <td>${s.ia3 ?? '-'}</td>
        <td class="${marksRisk ? 'red-text' : ''}">${avg.toFixed(1)}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">${BASE_STYLES}</head><body>
  ${COLLEGE_HEADER}
  <h2 style="color:#1a237e;">Individual Student Performance Report</h2>
  <table style="width:auto; border:none; margin:10px 0;">
    <tr><td><strong>Name:</strong></td><td>${data.studentName}</td></tr>
    <tr><td><strong>USN:</strong></td><td>${data.usn}</td></tr>
    <tr><td><strong>Department:</strong></td><td>${data.department}</td></tr>
    <tr><td><strong>Semester:</strong></td><td>${data.semester}</td></tr>
    <tr><td><strong>Section:</strong></td><td>${data.section}</td></tr>
  </table>
  <table>
    <thead><tr>
      <th>Code</th><th>Subject</th><th>Faculty</th><th>Attendance</th><th>IA1</th><th>IA2</th><th>IA3</th><th>Best-2 Avg</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-size:10px; color:#888;"><em>VTU Threshold: Attendance ≥ 75% | IA Best-of-2 Average ≥ 14</em></p>
  <p style="font-size:10px; color:#888;"><em>Cells in <span style="color:#c62828;">red</span> indicate Below Threshold</em></p>
  <div class="footer">Generated on: ${formatDate()} | VCET AMS - HOD Report</div>
</body></html>`;
}

export function generateClassReportHTML(data: {
  department: string;
  semester: number;
  section: string;
  students: Array<{
    usn: string;
    name: string;
    subjects: Array<{
      code: string;
      name: string;
      percentage: number;
      present: number;
      total: number;
    }>;
    overallPercentage: number;
  }>;
}): string {
  const headers = ['USN', 'Name', ...data.students[0]?.subjects.map((s) => s.code) ?? [], 'Overall'];
  const rows = data.students.map((st) => {
    const overallRisk = st.overallPercentage < 75;
    const subjCells = st.subjects.map((s) => {
      const risk = s.percentage < 75;
      return `<td class="${risk ? 'red-bg red-text' : ''}">${s.percentage.toFixed(1)}%</td>`;
    }).join('');
    return `<tr class="${overallRisk ? 'red-bg' : ''}"><td>${st.usn}</td><td>${st.name}</td>${subjCells}<td class="${overallRisk ? 'red-text' : ''}">${st.overallPercentage.toFixed(1)}%</td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">${BASE_STYLES}</head><body>
  ${COLLEGE_HEADER}
  <h2 style="color:#1a237e;">Class Report - Section ${data.section}</h2>
  <p><strong>${data.department}</strong> | Semester ${data.semester} | Section ${data.section}</p>
  <table>
    <thead><tr>${headers.map((h) => `<th>${h}</th>`).join('')}</tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-size:10px; color:#888;"><em>Percentages shown are attendance percentages. Red = Below 75% threshold.</em></p>
  <div class="footer">Generated on: ${formatDate()} | VCET AMS - HOD Report</div>
</body></html>`;
}

export function generateDefaultersHTML(data: {
  department: string;
  semester: number;
  defaulters: Array<{
    usn: string;
    name: string;
    section: string;
    attendancePercent: number;
    shortage: number;
    cieTotal: number;
    subjects: Array<{ code: string; name: string; percentage: number; present: number; total: number }>;
  }>;
}): string {
  const rows = data.defaulters.map((d) => {
    const detained = d.attendancePercent < 75 && d.cieTotal < 14;
    const subjDetails = d.subjects.map((s) =>
      `<span style="font-size:10px; display:block;margin:2px 0;">${s.code}: ${s.present}/${s.total} (${s.percentage.toFixed(1)}%)${s.percentage < 75 ? ' ⚠️' : ''}</span>`
    ).join('');
    return `
      <tr class="${detained ? 'red-bg' : ''}">
        <td>${d.usn}</td>
        <td>${d.name}</td>
        <td>${d.section}</td>
        <td class="${d.attendancePercent < 75 ? 'red-text' : ''}">${d.attendancePercent.toFixed(1)}%</td>
        <td class="red-text">${d.shortage.toFixed(1)}%</td>
        <td class="${d.cieTotal < 14 ? 'red-text' : ''}">${d.cieTotal}/40</td>
        <td>${subjDetails}</td>
      </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">${BASE_STYLES}</head><body>
  ${COLLEGE_HEADER}
  <h2 style="color:#c62828;">Defaulter / Detention List</h2>
  <p><strong>${data.department}</strong> | Semester ${data.semester}</p>
  <p style="color:#c62828; font-weight:bold;">Total Defaulters: ${data.defaulters.length}</p>
  <table>
    <thead><tr>
      <th>USN</th><th>Name</th><th>Sec</th><th>Attendance</th><th>Shortage</th><th>CIE Total</th><th>Subject Details</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <p style="font-size:10px; color:#888; margin-top:8px;">
    <strong>Criteria:</strong> Attendance &lt; 75% | CIE Total &lt; 14/40 | 
    <span style="color:#c62828;">Red rows</span> = Eligible for Detention (both criteria met)
  </p>
  <div class="signature">
    <div><p><strong>HOD</strong></p><p>${data.department} Department</p><p>Date: ${formatDate()}</p></div>
    <div style="text-align:right;"><p><strong>Principal</strong></p><p>VCET, Puttur</p></div>
  </div>
  <div class="footer">Generated on: ${formatDate()} | VCET AMS - HOD Report</div>
</body></html>`;
}

export function generateParentLetterHTML(data: {
  studentName: string;
  usn: string;
  department: string;
  semester: number;
  section: string;
  attendancePercent: number;
  cieTotal: number;
  shortage: number;
  subjects: Array<{ code: string; name: string; percentage: number; present: number; total: number }>;
  parentName: string;
}): string {
  const subjTable = data.subjects.map((s) => {
    const risk = s.percentage < 75;
    return `<tr class="${risk ? 'red-bg' : ''}"><td>${s.code}</td><td>${s.name}</td><td>${s.present}/${s.total}</td><td class="${risk ? 'red-text' : ''}">${s.percentage.toFixed(1)}%</td></tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html><head><meta charset="utf-8">${BASE_STYLES}</head><body>
  ${COLLEGE_HEADER}
  <div style="margin-bottom:20px;">
    <p><strong>Date:</strong> ${formatDate()}</p>
    <p><strong>To,</strong></p>
    <p>${data.parentName}</p>
    <p>Parent / Guardian of <strong>${data.studentName}</strong> (${data.usn})</p>
    <p>${data.department} - Section ${data.section}</p>
  </div>
  <hr style="border:1px solid #1a237e;">
  <h3 style="color:#c62828;">⚠️ Academic Performance Warning Notice</h3>
  <p>Dear Parent/Guardian,</p>
  <p>
    This is to bring to your kind attention that your ward <strong>${data.studentName}</strong> (USN: ${data.usn})
    is currently performing below the required academic thresholds as per VTU regulations.
  </p>
  <table style="width:auto; border:none; margin:12px 0;">
    <tr><td><strong>Current Attendance:</strong></td><td class="${data.attendancePercent < 75 ? 'red-text' : ''}" style="padding-left:12px;">${data.attendancePercent.toFixed(1)}%</td></tr>
    <tr><td><strong>Attendance Shortage:</strong></td><td style="padding-left:12px;color:#c62828;">${data.shortage.toFixed(1)}%</td></tr>
    <tr><td><strong>CIE Total:</strong></td><td style="padding-left:12px;" class="${data.cieTotal < 14 ? 'red-text' : ''}">${data.cieTotal}/40</td></tr>
    <tr><td><strong>VTU Threshold:</strong></td><td style="padding-left:12px;">Attendance ≥ 75% | CIE ≥ 14/40</td></tr>
  </table>
  <p><strong>Subject-wise Attendance:</strong></p>
  <table>
    <thead><tr><th>Code</th><th>Subject</th><th>Attendance</th><th>%</th></tr></thead>
    <tbody>${subjTable}</tbody>
  </table>
  <div style="background:#fff8e1; border:1px solid #f57f17; border-radius:6px; padding:10px; margin:16px 0;">
    <p style="color:#c62828; font-weight:bold; margin:0 0 6px;">⚠️ Action Required</p>
    <p style="margin:0; font-size:11px;">
      If the attendance does not improve, your ward may be <strong>detained</strong> from appearing for the 
      Semester End Examinations as per VTU regulations. We request you to meet the HOD urgently to discuss 
      the action plan for improvement.
    </p>
  </div>
  <div class="signature">
    <div>
      <p><strong>Prof. Pradeep Kumar KG</strong></p>
      <p>Head of Department</p>
      <p>${data.department} Department</p>
    </div>
    <div style="text-align:right;">
      <p><strong>Dr. Mahesh Prasanna K</strong></p>
      <p>Principal</p>
      <p>VCET, Puttur</p>
    </div>
  </div>
  <div class="footer">Generated on: ${formatDate()} | VCET AMS - Parent Communication Letter</div>
</body></html>`;
}
