import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAdmissionStore } from '../../store/admissionStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { generateRollNumber, getDeptCode } from '../../mock/admission';
import Card from '../../components/Card';

const GENDERS = ['MALE', 'FEMALE', 'OTHER'] as const;
const TYPES = ['CET', 'COMEDK', 'MQ'] as const;

type Entry = {
  key: string;
  name: string;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  phone: string;
  parentPhone: string;
  admissionType: 'CET' | 'COMEDK' | 'MQ';
};

export default function BulkStudentEntryScreen() {
  const { colors } = useAppTheme();
  const { batchForm, batches, loadBatches, bulkAddStudents, loadStudents } = useAdmissionStore();
  const [selectedBatchId, setSelectedBatchId] = useState('');
  const [count, setCount] = useState(5);
  const [entries, setEntries] = useState<Entry[]>([]);

  useEffect(() => { void loadBatches(); }, []);

  const selectedBatch = useMemo(() => batches.find((b) => b.id === selectedBatchId), [batches, selectedBatchId]);

  const generateEntries = () => {
    if (!selectedBatch) { Alert.alert('Select Batch', 'Choose a batch first'); return; }
    const newEntries: Entry[] = [];
    for (let i = 0; i < count; i++) {
      const rollNo = generateRollNumber(selectedBatch.department, selectedBatch.year);
      const seq = rollNo.slice(4);
      newEntries.push({
        key: rollNo,
        name: '',
        gender: 'MALE',
        phone: '',
        parentPhone: '',
        admissionType: 'CET',
      });
    }
    setEntries(newEntries);
  };

  const updateEntry = (key: string, field: keyof Entry, value: any) => {
    setEntries((prev) => prev.map((e) => (e.key === key ? { ...e, [field]: value } : e)));
  };

  const validateEntries = (): string | null => {
    if (entries.length === 0) return 'No entries to submit. Generate entry forms first.';
    const emptyName = entries.filter((e) => !e.name.trim());
    if (emptyName.length > 0) return `${emptyName.length} entries have empty names`;
    const invalidPhone = entries.filter((e) => e.phone.length > 0 && !/^\d{10}$/.test(e.phone));
    if (invalidPhone.length > 0) return `${invalidPhone.length} entries have invalid phone numbers (need 10 digits)`;
    const invalidParent = entries.filter((e) => e.parentPhone.length > 0 && !/^\d{10}$/.test(e.parentPhone));
    if (invalidParent.length > 0) return `${invalidParent.length} entries have invalid parent phone numbers`;
    return null;
  };

  const handleSubmit = async () => {
    if (!selectedBatch) { Alert.alert('Error', 'No batch selected'); return; }
    const error = validateEntries();
    if (error) { Alert.alert('Validation Error', error); return; }
    const cnt = await bulkAddStudents(entries.map(e => ({ ...e, rollNo: e.key })), selectedBatch.id, selectedBatch.department, selectedBatch.section);
    setEntries([]);
    Alert.alert('Success', `${cnt} students added to ${selectedBatch.department} batch`);
  };

  const deptCode = selectedBatch ? getDeptCode(selectedBatch.department) : 'XX';

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Admission Cell</Text>
        <Text className="text-2xl font-bold mb-4" style={{ color: colors.text }}>Bulk Student Entry</Text>

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-semibold text-sm mb-3" style={{ color: colors.text }}>Select Batch</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {batches.length === 0 && (
              <View className="rounded-lg p-4 border" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border }}>
                <Text className="text-sm text-center" style={{ color: colors.textMuted }}>No batches created yet</Text>
                <Text className="text-xs text-center mt-1" style={{ color: colors.textMuted }}>Create a batch first in the Batches tab</Text>
              </View>
            )}
            {batches.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => setSelectedBatchId(b.id)}
                className="px-3 py-2 rounded-lg"
                style={{ backgroundColor: selectedBatchId === b.id ? '#ea580c' : colors.bgCard, borderColor: selectedBatchId === b.id ? '#ea580c' : colors.border, borderWidth: selectedBatchId === b.id ? 0 : 1 }}
              >
                <Text className="text-xs font-medium" style={{ color: selectedBatchId === b.id ? '#ffffff' : colors.textSecondary }}>
                  {b.department} {b.year} Sec {b.section}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedBatch && (
            <View className="rounded-lg p-3 border" style={{ backgroundColor: colors.bgTertiary, borderColor: colors.border }}>
              <Text className="text-xs" style={{ color: colors.textSecondary }}>
                Roll range: {selectedBatch.year}{deptCode}{String(selectedBatch.startRollNo).padStart(3, '0')} → {selectedBatch.year}{deptCode}{String(selectedBatch.endRollNo).padStart(3, '0')}
              </Text>
              <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>Students so far: {selectedBatch.studentCount} / {selectedBatch.intakeSize}</Text>
            </View>
          )}
        </Card>

        <Card className="mb-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="font-semibold text-sm mb-3" style={{ color: colors.text }}>Number of Students</Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => setCount(Math.max(1, count - 1))} className="w-10 h-10 rounded-lg items-center justify-center border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Text className="text-lg" style={{ color: colors.text }}>-</Text>
            </TouchableOpacity>
            <TextInput
              className="rounded-lg px-4 py-2 text-center text-lg font-bold w-20"
              style={{ backgroundColor: colors.bgTertiary, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
              value={String(count)}
              onChangeText={(v) => setCount(Math.max(1, parseInt(v) || 1))}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => setCount(Math.min(20, count + 1))} className="w-10 h-10 rounded-lg items-center justify-center border" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
              <Text className="text-lg" style={{ color: colors.text }}>+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={generateEntries} className="bg-blue-600 rounded-xl p-3 mt-4 items-center">
            <Text className="text-white font-semibold">Generate {count} Entry Forms</Text>
          </TouchableOpacity>
        </Card>

        {entries.map((entry, idx) => (
          <Card key={entry.key} className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-orange-600 rounded-lg px-3 py-1">
                <Text className="text-white text-xs font-mono font-bold">{entry.key}</Text>
              </View>
              <Text className="text-xs" style={{ color: colors.textMuted }}>#{idx + 1}</Text>
            </View>

            <Text className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Student Name</Text>
            <TextInput
              className="rounded-lg px-3 py-2.5 text-sm mb-3"
              style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
              placeholder="Full name"
              placeholderTextColor={colors.placeholder}
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.key, 'name', v)}
            />

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Gender</Text>
                <View className="flex-row gap-1">
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => updateEntry(entry.key, 'gender', g)}
                      className="flex-1 py-2 rounded-lg"
                      style={{ backgroundColor: entry.gender === g ? '#ea580c' : colors.bgCard, borderColor: entry.gender === g ? '#ea580c' : colors.border, borderWidth: entry.gender === g ? 0 : 1 }}
                    >
                      <Text className="text-xs text-center font-medium" style={{ color: entry.gender === g ? '#ffffff' : colors.textSecondary }}>{g[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Admission</Text>
                <View className="flex-row gap-1">
                  {TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => updateEntry(entry.key, 'admissionType', t)}
                      className="flex-1 py-2 rounded-lg"
                      style={{ backgroundColor: entry.admissionType === t ? '#ea580c' : colors.bgCard, borderColor: entry.admissionType === t ? '#ea580c' : colors.border, borderWidth: entry.admissionType === t ? 0 : 1 }}
                    >
                      <Text className="text-[9px] text-center font-medium" style={{ color: entry.admissionType === t ? '#ffffff' : colors.textSecondary }}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mb-1">
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Student Phone</Text>
                <TextInput
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
                  placeholder="Phone"
                  placeholderTextColor={colors.placeholder}
                  value={entry.phone}
                  onChangeText={(v) => updateEntry(entry.key, 'phone', v)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <View className="flex-1">
                <Text className="text-xs font-medium mb-1" style={{ color: colors.textSecondary }}>Parent Phone</Text>
                <TextInput
                  className="rounded-lg px-3 py-2 text-sm"
                  style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
                  placeholder="Parent phone"
                  placeholderTextColor={colors.placeholder}
                  value={entry.parentPhone}
                  onChangeText={(v) => updateEntry(entry.key, 'parentPhone', v)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
            </View>
          </Card>
        ))}

        {entries.length > 0 && (
          <TouchableOpacity onPress={handleSubmit} className="bg-green-600 rounded-xl p-4 items-center mb-8">
            <Text className="text-white font-bold text-base">Submit {entries.length} Students</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
