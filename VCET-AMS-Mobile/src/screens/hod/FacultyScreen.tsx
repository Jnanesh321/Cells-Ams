import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, Text, TouchableOpacity, View, RefreshControl } from 'react-native';
import { useAuthStore } from '../../store/auth';
import { getFacultyByDepartment } from '../../mock/facultyData';
import Card from '../../components/Card';

export default function HodFacultyScreen() {
  const { user } = useAuthStore();
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
      <Card className={`bg-slate-900 border mb-2 ${selected === item.id ? 'border-purple-500' : 'border-slate-800'}`}>
        <View className="flex-row justify-between items-center">
          <View className="flex-1">
            <View className="flex-row items-center gap-2">
              <View className="w-8 h-8 rounded-full bg-purple-600 items-center justify-center">
                <Text className="text-white text-xs font-bold">
                  {item.name?.split(' ').map((s: string) => s[0]).join('').slice(0, 2) ?? 'NA'}
                </Text>
              </View>
              <View className="flex-1">
                <Text className="text-white font-semibold text-sm">{item.name}</Text>
                <Text className="text-slate-400 text-xs">{item.designation ?? 'Faculty'}</Text>
              </View>
            </View>
            {selected === item.id && (
              <View className="mt-3 pt-3 border-t border-slate-800">
                <Text className="text-slate-300 text-xs mb-1">Email: {item.email ?? 'N/A'}</Text>
                <Text className="text-slate-300 text-xs mb-1">Phone: {item.phone ?? 'N/A'}</Text>
                {item.qualification && (
                  <Text className="text-slate-300 text-xs mb-1">Qualification: {item.qualification}</Text>
                )}
                {item.yearsOfExperience && (
                  <Text className="text-slate-300 text-xs">Experience: {item.yearsOfExperience} years</Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-slate-950">
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">Faculty Directory</Text>
        <Text className="text-white text-2xl font-bold mb-1">{dept} Department</Text>
        <Text className="text-slate-500 text-sm mb-4">{faculty.length} faculty members</Text>
      </View>
      <FlatList
        className="px-4"
        data={faculty}
        keyExtractor={(item: any, index: number) => String(item.id ?? index)}
        renderItem={renderItem}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#a855f7" />}
        ListEmptyComponent={
          <Card className="bg-slate-900 border-slate-800">
            <Text className="text-slate-400 text-sm text-center">No faculty data available</Text>
          </Card>
        }
      />
    </View>
  );
}
