import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { getFacultyByDepartment } from '../../mock/facultyData';
import Card from '../../components/Card';

export default function HodFacultyScreen() {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const [refreshing, setRefreshing] = useState(false);
  const [selected, setSelected] = useState<string | null>(null);

  const dept = (user?.department ?? 'CSE') as any;

  const faculty = useMemo(() => {
    try {
      return getFacultyByDepartment(dept);
    } catch {
      return [];
    }
  }, [dept]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 800);
  }, []);

  const renderItem = ({ item }: { item: any }) => (
    <TouchableOpacity onPress={() => setSelected(selected === item.id ? null : item.id)}>
      <Card className="border mb-2" style={{ backgroundColor: colors.bgCard, borderColor: selected === item.id ? '#a855f7' : colors.border }}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {item.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2) ?? 'NA'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="font-semibold text-sm" style={{ color: colors.text }}>{item.name}</Text>
                <Text className="text-xs" style={{ color: colors.textMuted }}>{item.designation ?? 'Faculty'}</Text>
              </View>
            </View>
            {selected === item.id && (
              <View className="mt-3 pt-3 border-t" style={{ borderTopColor: colors.border }}>
                <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Email: {item.email ?? 'N/A'}</Text>
                <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Phone: {item.phone ?? 'N/A'}</Text>
                {item.qualification && (
                  <Text className="text-xs mb-1" style={{ color: colors.textSecondary }}>Qualification: {item.qualification}</Text>
                )}
                {item.yearsOfExperience && (
                  <Text className="text-xs" style={{ color: colors.textSecondary }}>Experience: {item.yearsOfExperience} years</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Faculty Directory</Text>
        <Text className="text-2xl font-bold mb-1" style={{ color: colors.text }}>{dept} Department</Text>
        <Text className="text-sm mb-4" style={{ color: colors.textMuted }}>{faculty.length} faculty members</Text>
      </View>
      <FlatList
        className="px-4"
        data={faculty}
        keyExtractor={(item: any, index: number) => String(item.id ?? index)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No faculty data available</Text>
          </Card>
        }
      />
    </View>
  );
}
