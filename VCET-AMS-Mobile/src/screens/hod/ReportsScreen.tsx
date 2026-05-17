import React, { useCallback, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, RefreshControl, Alert } from 'react-native';
import { useAuthStore } from '../../store/auth';
import Card from '../../components/Card';

const reportTypes = [
  { id: 'attendance', label: 'Attendance Report', desc: 'Subject-wise attendance summary', color: 'bg-blue-600' },
  { id: 'ia-marks', label: 'IA Marks Report', desc: 'Internal assessment marks overview', color: 'bg-green-600' },
  { id: 'detention', label: 'Detention List', desc: 'Students below 75% threshold', color: 'bg-red-600' },
  { id: 'academic', label: 'Academic Performance', desc: 'GPA and grade distribution', color: 'bg-purple-600' },
];

export default function HodReportsScreen() {
  const { user } = useAuthStore();
  const [refreshing, setRefreshing] = useState(false);

  const dept = user?.department ?? 'CSE';

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const handleGenerate = (report: typeof reportTypes[0]) => {
    Alert.alert(
      'Generate Report',
      `${report.label}\n\nDepartment: ${dept}\n\nThis will generate a PDF report for download.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Generate', onPress: () => Alert.alert('Success', `${report.label} generated successfully`) },
      ]
    );
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-950"
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
    >
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">{dept} Department</Text>
        <Text className="text-white text-2xl font-bold mb-4">Reports</Text>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-lg mb-4">Generate Reports</Text>
          {reportTypes.map((report) => (
            <TouchableOpacity key={report.id} onPress={() => handleGenerate(report)}>
              <View className="flex-row items-center mb-3 bg-slate-800 rounded-xl p-4 border border-slate-700">
                <View className={`w-10 h-10 ${report.color} rounded-lg items-center justify-center mr-3`}>
                  <Text className="text-white text-lg">📄</Text>
                </View>
                <View className="flex-1">
                  <Text className="text-white font-semibold">{report.label}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">{report.desc}</Text>
                </View>
                <Text className="text-purple-400 text-lg">{'>'}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </Card>

        <Card className="bg-slate-900 border-slate-800">
          <Text className="text-white font-bold text-lg mb-3">Recent Reports</Text>
          {['Attendance - Nov 2024', 'IA1 Marks Summary', 'Detention List - Odd Sem'].map((name, i) => (
            <View key={i} className="flex-row justify-between items-center py-3 border-b border-slate-800 last:border-0">
              <View>
                <Text className="text-white text-sm font-medium">{name}</Text>
                <Text className="text-slate-500 text-xs">Generated {['2 days ago', '1 week ago', '2 weeks ago'][i]}</Text>
              </View>
              <TouchableOpacity className="bg-slate-800 px-3 py-1 rounded-lg border border-slate-700">
                <Text className="text-purple-400 text-xs font-medium">View</Text>
              </TouchableOpacity>
            </View>
          ))}
        </Card>
      </View>
    </ScrollView>
  );
}
