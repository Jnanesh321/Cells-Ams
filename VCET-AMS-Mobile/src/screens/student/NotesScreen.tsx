import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  RefreshControl,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNotesStore } from '../../store/notesStore';
import Card from '../../components/Card';

const StudentNotesScreen = () => {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const { notes, loadMockData } = useNotesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);

  useEffect(() => { loadMockData(); }, [loadMockData]);

  const dept = user?.department ?? '';
  const semester = user?.semester ?? 1;

  const relevantNotes = useMemo(
    () => notes.filter((n) => n.department === dept && n.semester === semester),
    [notes, dept, semester]
  );

  const subjectGroups = useMemo(() => {
    const map = new Map<string, typeof relevantNotes>();
    relevantNotes.forEach((n) => {
      const existing = map.get(n.subjectCode) ?? [];
      existing.push(n);
      map.set(n.subjectCode, existing);
    });
    return Array.from(map.entries()).map(([code, subjectNotes]) => ({
      subjectCode: code,
      subjectName: subjectNotes[0].subjectName,
      notes: subjectNotes,
    }));
  }, [relevantNotes]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 500);
  }, [loadMockData]);

  if (selectedSubject) {
    const subjectNotes = relevantNotes.filter((n) => n.subjectCode === selectedSubject);
    const subjectName = subjectNotes[0]?.subjectName ?? '';
    return (
      <View className="flex-1" style={{ backgroundColor: colors.bg }}>
        <View className="px-4 pt-4 pb-2 flex-row items-center gap-3">
          <TouchableOpacity onPress={() => setSelectedSubject(null)} className="p-1">
            <Ionicons name="arrow-back" size={24} color={colors.textMuted} />
          </TouchableOpacity>
          <View>
            <Text className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Notes</Text>
            <Text className="text-lg font-bold mt-0.5" style={{ color: colors.text }}>{subjectName}</Text>
          </View>
        </View>

        <FlatList
          className="flex-1 px-4"
          data={subjectNotes}
          keyExtractor={(item) => item.id}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
          ListEmptyComponent={
            <View className="items-center mt-20">
              <Ionicons name="document-text-outline" size={48} color={colors.textTertiary} />
              <Text className="text-base mt-3" style={{ color: colors.textMuted }}>No notes for this subject</Text>
            </View>
          }
          ItemSeparatorComponent={() => <View className="h-3" />}
          renderItem={({ item }) => (
            <Card className="p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <View className="flex-row items-start gap-3">
                <View className="w-10 h-10 rounded-lg bg-indigo-900/50 items-center justify-center">
                  <Ionicons
                    name={item.fileType === 'image' ? 'image' : 'document-text'}
                    size={20}
                    color="#818cf8"
                  />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>{item.title}</Text>
                  {item.description ? (
                    <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.description}</Text>
                  ) : null}
                  <Text className="text-[10px] mt-2" style={{ color: colors.textMuted }}>
                    {item.fileName} • {new Date(item.uploadedAt).toLocaleDateString()}
                    {' • '}{item.uploadedByName}
                  </Text>
                </View>
                <TouchableOpacity className="bg-indigo-900/40 rounded-lg p-2">
                  <Ionicons name="download-outline" size={18} color="#818cf8" />
                </TouchableOpacity>
              </View>
            </Card>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    );
  }

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="px-4 pt-4 pb-2">
        <Text className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>Notes</Text>
        <Text className="text-xl font-bold mt-1" style={{ color: colors.text }}>Browse by Subject</Text>
      </View>

      <FlatList
        className="flex-1 px-4"
        data={subjectGroups}
        keyExtractor={(item) => item.subjectCode}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="folder-open-outline" size={48} color={colors.textTertiary} />
            <Text className="text-base mt-3" style={{ color: colors.textMuted }}>No notes available</Text>
            <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>Notes from your faculty will appear here</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => setSelectedSubject(item.subjectCode)}>
            <Card className="p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
              <View className="flex-row items-center gap-3">
                <View className="w-12 h-12 rounded-xl bg-indigo-900/40 items-center justify-center">
                  <Ionicons name="folder" size={24} color="#818cf8" />
                </View>
                <View className="flex-1">
                  <Text className="font-semibold" style={{ color: colors.text }}>{item.subjectName}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                    {item.subjectCode} • {item.notes.length} note{item.notes.length !== 1 ? 's' : ''}
                  </Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.placeholder} />
              </View>
            </Card>
          </TouchableOpacity>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />
    </View>
  );
};

export default StudentNotesScreen;
