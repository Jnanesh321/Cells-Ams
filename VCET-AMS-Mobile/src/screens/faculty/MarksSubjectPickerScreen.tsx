import React, { useMemo } from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getFacultySubjects } from '../../mock/facultySubjects';
import Card from '../../components/Card';

export default function MarksSubjectPickerScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
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
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>IA Marks Entry</Text>
        <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>Select Subject</Text>
      </View>
      <FlatList
        className="px-4"
        data={subjects}
        keyExtractor={(item: any) => `${item.subjectCode}-${item.section ?? 'A'}`}
        renderItem={({ item }: any) => (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate('VTUIAMarksEntry', {
                subjectCode: item.subjectCode,
                subjectId: item.subjectCode,
                subjectName: item.subject,
                section: item.section ?? 'A',
              })
            }
          >
            <Card className="mb-2" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <View className="flex-row justify-between items-center">
                <View className="flex-1">
                  <Text className="font-semibold text-sm" style={{ color: colors.text }}>{item.subject}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                    {item.subjectCode} • {item.section ? `Section ${item.section}` : ''} • Sem {item.semester}
                  </Text>
                </View>
                <Text className="text-blue-400 text-lg ml-2">{'>'}</Text>
              </View>
            </Card>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No subjects assigned</Text>
          </Card>
        }
      />
    </View>
  );
}
