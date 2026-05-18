import React, { useCallback, useMemo, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { mockStudents } from '../../mock';
import { getStudentsForSubject } from '../../mock/studentAttendance';
import { getFacultySubjects } from '../../mock/facultySubjects';
import { getSemesterSubjects } from '../../mock/subjects';
import { generatePDF } from '../../utils/pdfHelper';
import Card from '../../components/Card';
import Button from '../../components/Button';
import Loader from '../../components/Loader';

type ReportType = 'individual' | 'class' | 'defaulters' | 'parent-letter';

const REPORT_CONFIG: Array<{ id: ReportType; label: string; desc: string; icon: string; color: string }> = [
  { id: 'individual', label: 'Individual Report', desc: 'Per-student IA & attendance performance', icon: '👤', color: 'bg-blue-600' },
  { id: 'class', label: 'Class Report', desc: 'Section-wise attendance summary table', icon: '📊', color: 'bg-green-600' },
  { id: 'defaulters', label: 'Defaulter List', desc: 'Students below 75% attendance threshold', icon: '⚠️', color: 'bg-red-600' },
  { id: 'parent-letter', label: 'Parent Letter', desc: 'Formal warning letter for at-risk students', icon: '📨', color: 'bg-purple-600' },
];

const MOCK_CLASS_DATA = {
  section: 'A',
  students: [
    { usn: '4VP21CS001', name: 'Aditya Kumar', overallPercentage: 85.3, subjects: [
      { code: 'BCS501', name: 'Machine Learning', percentage: 92.0, present: 46, total: 50 },
      { code: 'BCS502', name: 'Web Technologies', percentage: 78.0, present: 39, total: 50 },
      { code: 'BCS503', name: 'Cloud Computing', percentage: 86.0, present: 43, total: 50 },
    ]},
    { usn: '4VP21CS002', name: 'Priya Sharma', overallPercentage: 92.7, subjects: [
      { code: 'BCS501', name: 'Machine Learning', percentage: 96.0, present: 48, total: 50 },
      { code: 'BCS502', name: 'Web Technologies', percentage: 88.0, present: 44, total: 50 },
      { code: 'BCS503', name: 'Cloud Computing', percentage: 94.0, present: 47, total: 50 },
    ]},
    { usn: '4VP21CS003', name: 'Rajesh Patel', overallPercentage: 62.0, subjects: [
      { code: 'BCS501', name: 'Machine Learning', percentage: 71.4, present: 25, total: 35 },
      { code: 'BCS502', name: 'Web Technologies', percentage: 54.5, present: 18, total: 33 },
      { code: 'BCS503', name: 'Cloud Computing', percentage: 60.0, present: 21, total: 35 },
    ]},
  ],
};

const MOCK_INDIVIDUAL_DATA = {
  studentName: 'Rajesh Patel',
  usn: '4VP21CS003',
  department: 'CSE',
  semester: 5,
  section: 'A',
  subjects: [
    { code: 'BCS501', name: 'Machine Learning', faculty: 'Dr. Ajith Hebbar H', present: 25, total: 35, percentage: 71.4, ia1: 18, ia2: 12, ia3: 14 },
    { code: 'BCS502', name: 'Web Technologies', faculty: 'Mrs. Vaishnavi K V', present: 18, total: 33, percentage: 54.5, ia1: 12, ia2: 8, ia3: 10 },
    { code: 'BCS503', name: 'Cloud Computing', faculty: 'Mr. Venkatesh Y C', present: 21, total: 35, percentage: 60.0, ia1: 15, ia2: 11, ia3: 9 },
  ],
};

const MOCK_DEFAULTERS = {
  defaulters: [
    { usn: '4VP21CS003', name: 'Rajesh Patel', section: 'A', attendancePercent: 62.0, shortage: 13.0, cieTotal: 12, subjects: [
      { code: 'BCS501', name: 'Machine Learning', present: 25, total: 35, percentage: 71.4 },
      { code: 'BCS502', name: 'Web Technologies', present: 18, total: 33, percentage: 54.5 },
    ]},
    { usn: '4VP21CS005', name: 'Rohan Pillai', section: 'B', attendancePercent: 68.0, shortage: 7.0, cieTotal: 15, subjects: [
      { code: 'BCS501', name: 'Machine Learning', present: 30, total: 44, percentage: 68.2 },
    ]},
    { usn: '4VP21CS007', name: 'Sneha Kumari', section: 'A', attendancePercent: 58.0, shortage: 17.0, cieTotal: 10, subjects: [
      { code: 'BCS502', name: 'Web Technologies', present: 20, total: 38, percentage: 52.6 },
      { code: 'BCS503', name: 'Cloud Computing', present: 24, total: 40, percentage: 60.0 },
    ]},
    { usn: '4VP21CS010', name: 'Kavya Singh', section: 'B', attendancePercent: 68.0, shortage: 7.0, cieTotal: 22, subjects: [
      { code: 'BCS501', name: 'Machine Learning', present: 32, total: 46, percentage: 69.6 },
    ]},
  ],
};

const MOCK_PARENT_LETTER = {
  parentName: 'Mr. Suresh Patel',
};

export default function HodReportsScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedReport, setSelectedReport] = useState<ReportType | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  const dept = user?.department ?? 'CSE';

  const deptStudents = useMemo(() =>
    mockStudents.filter((s) => s.department === dept),
    [dept]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleGenerate = async (reportType: ReportType) => {
    setGenerating(reportType);
    try {
      switch (reportType) {
        case 'individual': {
          const target = MOCK_INDIVIDUAL_DATA;
          await generatePDF(reportType, target, `${target.studentName}_Performance`);
          break;
        }
        case 'class': {
          const target = {
            department: dept,
            semester: 5,
            section: MOCK_CLASS_DATA.section,
            students: MOCK_CLASS_DATA.students,
          };
          await generatePDF(reportType, target, `${dept}_Sem5_Sec${target.section}_ClassReport`);
          break;
        }
        case 'defaulters': {
          const target = {
            department: dept,
            semester: 5,
            defaulters: MOCK_DEFAULTERS.defaulters,
          };
          await generatePDF(reportType, target, `${dept}_Defaulters`);
          break;
        }
        case 'parent-letter': {
          const target = {
            ...MOCK_INDIVIDUAL_DATA,
            parentName: MOCK_PARENT_LETTER.parentName,
          };
          await generatePDF(reportType, target, `${target.studentName}_ParentLetter`);
          break;
        }
      }
    } finally {
      setGenerating(null);
    }
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">{dept} Department</Text>
        <Text className="text-white text-2xl font-bold mb-4">Reports</Text>

        <Card className="bg-gradient-to-r from-purple-700 to-purple-900 border-0 mb-4">
          <Text className="text-white font-bold text-lg mb-1">Department Summary</Text>
          <Text className="text-purple-200 text-sm">
            {deptStudents.length} Students • {MOCK_CLASS_DATA.students.filter(s => s.overallPercentage < 75).length} At Risk
          </Text>
        </Card>

        <Text className="text-white font-bold text-base mb-3">Generate Reports</Text>
        {REPORT_CONFIG.map((report) => {
          const isGenerating = generating === report.id;
          return (
            <TouchableOpacity
              key={report.id}
              onPress={() => handleGenerate(report.id)}
              disabled={generating !== null}
              activeOpacity={0.7}
            >
              <Card className={`bg-slate-900 border-slate-800 mb-3 ${isGenerating ? 'opacity-60' : ''}`}>
                <View className="flex-row items-center">
                  <View className={`w-12 h-12 ${report.color} rounded-xl items-center justify-center mr-3`}>
                    <Text className="text-white text-xl">{report.icon}</Text>
                  </View>
                  <View className="flex-1">
                    <View className="flex-row items-center gap-2">
                      <Text className="text-white font-bold text-base">{report.label}</Text>
                      {isGenerating && <Loader />}
                    </View>
                    <Text className="text-slate-400 text-xs mt-0.5">{report.desc}</Text>
                  </View>
                  <Text className="text-purple-400 text-lg">{isGenerating ? '...' : '>'}</Text>
                </View>
              </Card>
            </TouchableOpacity>
          );
        })}

        <Card className="bg-amber-900/30 border border-amber-800/60 mb-4">
          <Text className="text-amber-300 font-semibold text-sm">⚠️ VTU 2022 Scheme</Text>
          <Text className="text-amber-200 text-xs mt-1 leading-5">
            Reports follow VTU regulations: Attendance ≥ 75% required. IA calculated as best-of-2 average.
            Students below both thresholds are marked for detention.
          </Text>
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <Text className="text-white font-bold text-lg mb-3">Recent Reports</Text>
          {generating ? (
            <Text className="text-slate-400 text-sm">Generating report...</Text>
          ) : (
            [
              { name: `${dept} Attendance - May 2026`, date: '2 days ago' },
              { name: `IA1 Marks Summary - Sem 5`, date: '1 week ago' },
              { name: `Detention List - Odd Sem`, date: '2 weeks ago' },
            ].map((item, i) => (
              <View key={i} className="flex-row justify-between items-center py-3 border-b border-slate-800 last:border-0">
                <View className="flex-1">
                  <Text className="text-white text-sm font-medium">{item.name}</Text>
                  <Text className="text-slate-500 text-xs">Generated {item.date}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => Alert.alert('View', `${item.name}\n\nPDF preview coming soon.`)}
                  className="bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700"
                >
                  <Text className="text-purple-400 text-xs font-medium">View</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </Card>
      </View>
    </ScrollView>
  );
}
