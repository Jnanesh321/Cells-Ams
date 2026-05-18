export const mockParents = [
  {
    id: 'PARENT-4VP21CS001',
    usn: 'PARENT-4VP21CS001',
    wardUsn: '4VP21CS001',
    password: 'parent@123',
    name: 'Mr. Arjun Patel (ward: Aditya Kumar)',
    email: 'parent.aditya@vcet.ac.in',
    phone: '+91 9845123001',
    department: 'CSE',
  },
  {
    id: 'PARENT-4VP21CS002',
    usn: 'PARENT-4VP21CS002',
    wardUsn: '4VP21CS002',
    password: 'parent@123',
    name: 'Mrs. Lakshmi Sharma (ward: Priya Sharma)',
    email: 'parent.priya@vcet.ac.in',
    phone: '+91 9845123002',
    department: 'CSE',
  },
  {
    id: 'PARENT-4VP21CS003',
    usn: 'PARENT-4VP21CS003',
    wardUsn: '4VP21CS003',
    password: 'parent@123',
    name: 'Mr. Suresh Patel (ward: Rajesh Patel)',
    email: 'parent.rajesh@vcet.ac.in',
    phone: '+91 9845123003',
    department: 'CSE',
  },
  {
    id: 'PARENT-4VP21CS008',
    usn: 'PARENT-4VP21CS008',
    wardUsn: '4VP21CS008',
    password: 'parent@123',
    name: 'Mrs. Meera Singh (ward: Ananya Singh)',
    email: 'parent.ananya@vcet.ac.in',
    phone: '+91 9845123004',
    department: 'CSE',
  },
  {
    id: 'PARENT-4VP21EC001',
    usn: 'PARENT-4VP21EC001',
    wardUsn: '4VP21EC001',
    password: 'parent@123',
    name: 'Mr. Krishna Kumar (ward: Ravi Kumar)',
    email: 'parent.ravi@vcet.ac.in',
    phone: '+91 9845123005',
    department: 'ECE',
  },
  {
    id: 'PARENT-4VP21AI001',
    usn: 'PARENT-4VP21AI001',
    wardUsn: '4VP21AI001',
    password: 'parent@123',
    name: 'Mrs. Sunita Patel (ward: Vishal Patel)',
    email: 'parent.vishal@vcet.ac.in',
    phone: '+91 9845123006',
    department: 'AIML',
  },
];

export function getParentByUSN(usn: string) {
  return mockParents.find((p) => p.usn === usn) ?? null;
}

export function getParentByParentId(id: string) {
  return mockParents.find((p) => p.id === id) ?? null;
}
