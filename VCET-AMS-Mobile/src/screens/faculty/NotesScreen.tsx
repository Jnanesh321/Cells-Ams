import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  FlatList,
  Modal,
  RefreshControl,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useNotesStore } from '../../store/notesStore';
import { getFacultySubjects } from '../../mock/facultySubjects';
import type { FacultySubjectAssignment } from '../../mock/facultySubjects';
import Card from '../../components/Card';
import Button from '../../components/Button';

const FacultyNotesScreen = () => {
  const { user } = useAuthStore();
  const { colors } = useAppTheme();
  const { notes, addNote, deleteNote, loadMockData } = useNotesStore();
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedSubject, setSelectedSubject] = useState<FacultySubjectAssignment | null>(null);
  const [showSubjectPicker, setShowSubjectPicker] = useState(false);

  useEffect(() => { loadMockData(); }, [loadMockData]);

  const facultyId = user?.id ?? '';
  const facultyName = user?.name ?? '';
  const dept = user?.department ?? '';

  const mySubjects = useMemo(() => getFacultySubjects(facultyId), [facultyId]);

  const myNotes = useMemo(
    () => notes.filter((n) => n.uploadedBy === facultyId),
    [notes, facultyId]
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    loadMockData();
    setTimeout(() => setRefreshing(false), 500);
  }, [loadMockData]);

  const handleUpload = useCallback(() => {
    if (!title.trim() || !selectedSubject) return;
    addNote({
      title: title.trim(),
      description: description.trim(),
      subjectCode: selectedSubject.subjectCode,
      subjectName: selectedSubject.subject,
      fileName: `${title.trim().replace(/\s+/g, '_')}.pdf`,
      fileUri: '',
      fileType: 'pdf',
      uploadedBy: facultyId,
      uploadedByName: facultyName,
      semester: selectedSubject.semester,
      department: dept,
      section: selectedSubject.section,
    });
    setTitle('');
    setDescription('');
    setSelectedSubject(null);
    setShowModal(false);
  }, [title, description, selectedSubject, facultyId, facultyName, dept, addNote]);

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="px-4 pt-4 pb-2 flex-row items-center justify-between">
        <View>
          <Text className="text-xs uppercase tracking-[0.2em]" style={{ color: colors.textMuted }}>My Notes</Text>
          <Text className="text-xl font-bold mt-1" style={{ color: colors.text }}>Uploaded Notes</Text>
        </View>
        <TouchableOpacity
          onPress={() => setShowModal(true)}
          className="bg-indigo-600 w-10 h-10 rounded-full items-center justify-center"
        >
          <Ionicons name="add" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        className="flex-1 px-4"
        data={myNotes}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#6366F1" />}
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="document-text-outline" size={48} color={colors.textMuted} />
            <Text className="text-base mt-3" style={{ color: colors.textMuted }}>No notes uploaded yet</Text>
            <Text className="text-xs mt-1" style={{ color: colors.textTertiary }}>Tap + to upload your first note</Text>
          </View>
        }
        ItemSeparatorComponent={() => <View className="h-3" />}
        renderItem={({ item }) => (
          <Card className="p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row items-start gap-3">
              <View className="w-10 h-10 rounded-lg bg-indigo-900/50 items-center justify-center">
                <Ionicons name="document-text" size={20} color="#818cf8" />
              </View>
              <View className="flex-1">
                <Text className="font-semibold" style={{ color: colors.text }}>{item.title}</Text>
                <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{item.subjectName}</Text>
                {item.description ? (
                  <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>{item.description}</Text>
                ) : null}
                <Text className="text-[10px] mt-2" style={{ color: colors.textTertiary }}>
                  {item.fileName} • {new Date(item.uploadedAt).toLocaleDateString()}
                  {item.section ? ` • Sec ${item.section}` : ''}
                </Text>
              </View>
              <TouchableOpacity onPress={() => deleteNote(item.id)} className="p-1">
                <Ionicons name="trash-outline" size={18} color="#ef4444" />
              </TouchableOpacity>
            </View>
          </Card>
        )}
        contentContainerStyle={{ paddingBottom: 24 }}
      />

      <Modal visible={showModal} transparent animationType="slide">
        <View className="flex-1 justify-end" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View className="rounded-t-2xl p-5 max-h-[80%]" style={{ backgroundColor: colors.bgSecondary }}>
            <ScrollView>
              <Text className="text-lg font-bold mb-4" style={{ color: colors.text }}>Upload Note</Text>

              <Text className="text-xs mb-1.5" style={{ color: colors.textMuted }}>Title</Text>
              <TextInput
                className="rounded-xl px-4 py-3 mb-3"
                style={{ backgroundColor: colors.bgCard, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
                placeholder="e.g. Unit 1 - Introduction"
                placeholderTextColor={colors.placeholder}
                value={title}
                onChangeText={setTitle}
              />

              <Text className="text-xs mb-1.5" style={{ color: colors.textMuted }}>Subject</Text>
              <TouchableOpacity
                onPress={() => setShowSubjectPicker(true)}
                className="rounded-xl px-4 py-3 mb-3 flex-row items-center justify-between"
                style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
              >
                <Text className={selectedSubject ? '' : ''} style={{ color: selectedSubject ? colors.text : colors.placeholder }}>
                  {selectedSubject ? `${selectedSubject.subject} (${selectedSubject.section})` : 'Select subject'}
                </Text>
                <Ionicons name="chevron-down" size={18} color={colors.placeholder} />
              </TouchableOpacity>

              <Text className="text-xs mb-1.5" style={{ color: colors.textMuted }}>Description (optional)</Text>
              <TextInput
                className="rounded-xl px-4 py-3 mb-5"
                style={{ backgroundColor: colors.bgCard, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
                placeholder="e.g. Covers chapters 1-3"
                placeholderTextColor={colors.placeholder}
                value={description}
                onChangeText={setDescription}
                multiline
              />

              <View className="flex-row gap-3">
                <Button
                  title="Cancel"
                  onPress={() => { setShowModal(false); setSelectedSubject(null); setTitle(''); setDescription(''); }}
                  style={{ backgroundColor: colors.bgCard }}
                />
                <Button
                  title="Upload"
                  onPress={handleUpload}
                  disabled={!title.trim() || !selectedSubject}
                />
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <Modal visible={showSubjectPicker} transparent animationType="fade">
        <View className="flex-1 justify-center px-6" style={{ backgroundColor: 'rgba(0,0,0,0.6)' }}>
          <View className="rounded-2xl p-5 max-h-[70%]" style={{ backgroundColor: colors.bgSecondary }}>
            <Text className="text-lg font-bold mb-3" style={{ color: colors.text }}>Select Subject</Text>
            <FlatList
              data={mySubjects}
              keyExtractor={(item, i) => `${item.subjectCode}-${item.section}-${i}`}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => { setSelectedSubject(item); setShowSubjectPicker(false); }}
                  className="rounded-xl p-3 mb-2"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}
                >
                  <Text className="font-medium" style={{ color: colors.text }}>{item.subject}</Text>
                  <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                    {item.subjectCode} • Sem {item.semester} • Sec {item.section}
                  </Text>
                </TouchableOpacity>
              )}
              ListEmptyComponent={
                <Text className="text-center mt-4" style={{ color: colors.textMuted }}>No subjects assigned</Text>
              }
            />
            <Button title="Close" onPress={() => setShowSubjectPicker(false)} style={{ backgroundColor: colors.bgCard }} />
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FacultyNotesScreen;
