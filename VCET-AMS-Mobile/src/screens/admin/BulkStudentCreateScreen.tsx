import React, { useMemo, useState } from 'react';
import { Alert, FlatList, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getAllDepartments, getDepartmentName, DepartmentCode } from '../../constants/departments';
import Card from '../../components/Card';
import Button from '../../components/Button';

const SECTIONS = ['A', 'B', 'C'];
const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

function generateStrongPassword(length = 10): string {
  const upper = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const all = upper + lower + digits;
  let pwd = '';
  pwd += upper[Math.floor(Math.random() * upper.length)];
  pwd += lower[Math.floor(Math.random() * lower.length)];
  pwd += digits[Math.floor(Math.random() * digits.length)];
  for (let i = 3; i < length; i++) {
    pwd += all[Math.floor(Math.random() * all.length)];
  }
  return pwd.split('').sort(() => Math.random() - 0.5).join('');
}

function generateUSN(department: string, year: number, index: number): string {
  const deptCode = department.slice(0, 2).toUpperCase();
  const yr = String(year).slice(-2);
  return `4VP${yr}${deptCode}${String(index + 1).padStart(3, '0')}`;
}

export default function BulkStudentCreateScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();
  const departments = useMemo(() => getAllDepartments(), []);
  const [selectedDept, setSelectedDept] = useState('CSE');
  const [selectedSection, setSelectedSection] = useState('A');
  const [selectedSemester, setSelectedSemester] = useState(5);
  const [count, setCount] = useState('10');
  const [password, setPassword] = useState(generateStrongPassword());
  const [preview, setPreview] = useState<Array<{ usn: string; name: string; section: string }> | null>(null);

  const handleRegenerate = () => setPassword(generateStrongPassword());

  const handlePreview = () => {
    const num = parseInt(count, 10);
    if (!num || num < 1 || num > 50) {
      Alert.alert('Error', 'Enter a count between 1 and 50');
      return;
    }
    const year = 2024 - Math.floor((selectedSemester - 1) / 2);
    const students = Array.from({ length: num }, (_, i) => ({
      usn: generateUSN(selectedDept, year, i),
      name: `Student ${selectedDept}${selectedSection}${selectedSemester}_${i + 1}`,
      section: selectedSection,
    }));
    setPreview(students);
  };

  const handleConfirm = () => {
    if (!preview || preview.length === 0) return;
    Alert.alert(
      'Confirm Creation',
      `Create ${preview.length} students in ${getDepartmentName(selectedDept as DepartmentCode)} Section ${selectedSection}?\n\nPassword for all: ${password}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: () => {
            Alert.alert('Success', `${preview.length} students created successfully`);
            setPreview(null);
            setPassword(generateStrongPassword());
            navigation.goBack();
          },
        },
      ]
    );
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-slate-400 text-xs uppercase tracking-widest">Admin</Text>
            <Text className="text-white text-2xl font-bold mt-1">Bulk Student Create</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <Text className="text-white text-sm font-medium">Back</Text>
          </TouchableOpacity>
        </View>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-base mb-4">Student Details</Text>

          <Text className="text-slate-300 text-xs mb-1">Department</Text>
          <View className="flex-row flex-wrap gap-1 mb-3">
            {departments.map((d) => (
              <TouchableOpacity
                key={d.code}
                onPress={() => setSelectedDept(d.code)}
                className={`px-3 py-1.5 rounded-full ${selectedDept === d.code ? 'bg-blue-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-xs ${selectedDept === d.code ? 'text-white' : 'text-slate-300'}`}>{d.code}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-xs mb-1">Section</Text>
          <View className="flex-row gap-2 mb-3">
            {SECTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setSelectedSection(s)}
                className={`px-4 py-2 rounded-lg ${selectedSection === s ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-sm font-semibold ${selectedSection === s ? 'text-white' : 'text-slate-300'}`}>Section {s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-xs mb-1">Semester</Text>
          <View className="flex-row flex-wrap gap-1 mb-3">
            {SEMESTERS.map((sem) => (
              <TouchableOpacity
                key={sem}
                onPress={() => setSelectedSemester(sem)}
                className={`px-3 py-1.5 rounded-full ${selectedSemester === sem ? 'bg-green-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-xs ${selectedSemester === sem ? 'text-white' : 'text-slate-300'}`}>Sem {sem}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-xs mb-1">Number of Students (1-50)</Text>
          <TextInput
            className="bg-slate-800 text-white rounded-lg px-4 py-3 mb-4 border border-slate-700"
            value={count}
            onChangeText={setCount}
            keyboardType="number-pad"
            placeholder="10"
            placeholderTextColor="#64748b"
          />

          <Text className="text-slate-300 text-xs mb-1">Password (all students)</Text>
          <View className="flex-row items-center gap-2 mb-4">
            <View className="flex-1 bg-slate-800 rounded-lg border border-slate-700 px-4 py-3">
              <Text className="text-green-300 font-mono text-sm">{password}</Text>
            </View>
            <TouchableOpacity onPress={handleRegenerate} className="bg-slate-700 px-3 py-3 rounded-lg border border-slate-600">
              <Text className="text-white text-xs font-medium">⟳</Text>
            </TouchableOpacity>
          </View>

          <Button title="Preview Students" onPress={handlePreview} className="bg-indigo-600" />
        </Card>

        {preview && (
          <Card className="bg-slate-900 border-slate-800 mb-4">
            <View className="flex-row justify-between items-center mb-3">
              <Text className="text-white font-bold text-base">Preview ({preview.length} students)</Text>
              <Text className="text-green-300 text-xs font-mono">Pwd: {password}</Text>
            </View>
            <FlatList
              scrollEnabled={false}
              data={preview}
              keyExtractor={(_, i) => String(i)}
              renderItem={({ item, index }) => (
                <View className="flex-row items-center bg-slate-800 rounded-lg px-3 py-2 mb-1 border border-slate-700">
                  <Text className="text-slate-400 text-xs w-8">{index + 1}.</Text>
                  <View className="flex-1">
                    <Text className="text-white text-sm">{item.name}</Text>
                    <Text className="text-slate-400 text-xs">{item.usn} • Sec {item.section}</Text>
                  </View>
                </View>
              )}
              ListFooterComponent={
                <View className="mt-4">
                  <Button title={`Confirm Create ${preview.length} Students`} onPress={handleConfirm} className="bg-green-600" />
                </View>
              }
            />
          </Card>
        )}
      </View>
    </ScrollView>
  );
}
