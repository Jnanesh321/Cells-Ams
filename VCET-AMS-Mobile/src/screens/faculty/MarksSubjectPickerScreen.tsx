import React, { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { getFacultySubjects } from '../../mock/facultySubjects';
import Card from '../../components/Card';

export default function MarksSubjectPickerScreen() {
  const { user } = useAuthStore();
  const navigation = useNavigation<any>();

  const subjects = useMemo(() => {
    const facultyId = user?.id ?? user?.usn ?? '';
    try {
      return getFacultySubjects(facultyId);
    } catch {
      return [];
    }
  }, [user]);

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4 pb-2">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">IA Marks Entry</Text>
        <Text className="text-white text-2xl font-bold mt-1">Select Subject</Text>
      </View>
      <FlatList
        className="px-4"
        data={subjects}
        keyExtractor={(item: any) => `${item.subjectCode}-${item.section ?? 'A'}`}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('IAMarksEntry', {
                subjectId: item.subjectCode,
                subjectName: item.subject,
                section: item.section ?? 'A',
              })
            }
          >
            <Card className="bg-slate-900 border-slate-800 mb-2">
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="text-white font-semibold text-sm">{item.subject}</Text>
                  <Text className="text-slate-400 text-xs mt-0.5">
                    {item.subjectCode} • {item.section ? `Section ${item.section}` : ''} • Sem {item.semester}
                  </Text>
                </View>
                <Text className="text-blue-400 text-lg ml-2">{'>'}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No subjects assigned</Text>
          </Card>
        }
      />
    </View>
  );
}
