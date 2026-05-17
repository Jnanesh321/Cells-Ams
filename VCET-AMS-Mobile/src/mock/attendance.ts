export const mockAttendance = {
  '4VP21CS001': {
    CS501: { subject: 'Data Structures', present: 38, total: 40, percentage: 95 },
    CS502: { subject: 'Web Development', present: 35, total: 40, percentage: 87.5 },
    CS503: { subject: 'Database Systems', present: 39, total: 40, percentage: 97.5 },
    CS504: { subject: 'Algorithms', present: 36, total: 40, percentage: 90 },
  },
  '4VP21CS002': {
    CS501: { subject: 'Data Structures', present: 40, total: 40, percentage: 100 },
    CS502: { subject: 'Web Development', present: 39, total: 40, percentage: 97.5 },
    CS503: { subject: 'Database Systems', present: 40, total: 40, percentage: 100 },
    CS504: { subject: 'Algorithms', present: 38, total: 40, percentage: 95 },
  },
  '4VP21CS003': {
    CS501: { subject: 'Data Structures', present: 32, total: 40, percentage: 80 },
    CS502: { subject: 'Web Development', present: 30, total: 40, percentage: 75 },
    CS503: { subject: 'Database Systems', present: 35, total: 40, percentage: 87.5 },
    CS504: { subject: 'Algorithms', present: 28, total: 40, percentage: 70 },
  },
  '4VP21CS004': {
    CS501: { subject: 'Data Structures', present: 39, total: 40, percentage: 97.5 },
    CS502: { subject: 'Web Development', present: 38, total: 40, percentage: 95 },
    CS503: { subject: 'Database Systems', present: 40, total: 40, percentage: 100 },
    CS504: { subject: 'Algorithms', present: 37, total: 40, percentage: 92.5 },
  },
  '4VP21CS005': {
    CS501: { subject: 'Data Structures', present: 25, total: 40, percentage: 62.5 },
    CS502: { subject: 'Web Development', present: 24, total: 40, percentage: 60 },
    CS503: { subject: 'Database Systems', present: 26, total: 40, percentage: 65 },
    CS504: { subject: 'Algorithms', present: 22, total: 40, percentage: 55 },
  },
};

export const mockLowAttendanceAlerts = [
  { usn: '4VP21CS005', name: 'Vikram Singh', attendance: 60.5, threshold: 75 },
  { usn: '4VP21CS009', name: 'Arjun Nair', attendance: 68, threshold: 75 },
  { usn: '4VP21EC003', name: 'Ashok Verma', attendance: 72, threshold: 75 },
];
