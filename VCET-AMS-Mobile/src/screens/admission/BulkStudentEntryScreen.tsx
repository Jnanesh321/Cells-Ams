import React, { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAdmissionStore } from '../../store/admissionStore';
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
    <ScrollView className="flex-1 bg-slate-950">
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">Admission Cell</Text>
        <Text className="text-white text-2xl font-bold mb-4">Bulk Student Entry</Text>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-semibold text-sm mb-3">Select Batch</Text>
          <View className="flex-row flex-wrap gap-2 mb-3">
            {batches.length === 0 && (
              <View className="bg-slate-800 rounded-lg p-4 border border-slate-700">
                <Text className="text-slate-400 text-sm text-center">No batches created yet</Text>
                <Text className="text-slate-500 text-xs text-center mt-1">Create a batch first in the Batches tab</Text>
              </View>
            )}
            {batches.map((b) => (
              <TouchableOpacity
                key={b.id}
                onPress={() => setSelectedBatchId(b.id)}
                className={`px-3 py-2 rounded-lg ${selectedBatchId === b.id ? 'bg-orange-600' : 'bg-slate-800 border border-slate-700'}`}
              >
                <Text className={`text-xs font-medium ${selectedBatchId === b.id ? 'text-white' : 'text-slate-300'}`}>
                  {b.department} {b.year} Sec {b.section}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {selectedBatch && (
            <View className="bg-slate-800 rounded-lg p-3 border border-slate-700">
              <Text className="text-slate-300 text-xs">
                Roll range: {selectedBatch.year}{deptCode}{String(selectedBatch.startRollNo).padStart(3, '0')} → {selectedBatch.year}{deptCode}{String(selectedBatch.endRollNo).padStart(3, '0')}
              </Text>
              <Text className="text-slate-400 text-xs mt-1">Students so far: {selectedBatch.studentCount} / {selectedBatch.intakeSize}</Text>
            </View>
          )}
        </Card>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-semibold text-sm mb-3">Number of Students</Text>
          <View className="flex-row items-center gap-3">
            <TouchableOpacity onPress={() => setCount(Math.max(1, count - 1))} className="bg-slate-800 w-10 h-10 rounded-lg items-center justify-center border border-slate-700">
              <Text className="text-white text-lg">-</Text>
            </TouchableOpacity>
            <TextInput
              className="bg-slate-800 rounded-lg px-4 py-2 text-white text-center text-lg font-bold border border-slate-700 w-20"
              value={String(count)}
              onChangeText={(v) => setCount(Math.max(1, parseInt(v) || 1))}
              keyboardType="number-pad"
            />
            <TouchableOpacity onPress={() => setCount(Math.min(20, count + 1))} className="bg-slate-800 w-10 h-10 rounded-lg items-center justify-center border border-slate-700">
              <Text className="text-white text-lg">+</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity onPress={generateEntries} className="bg-blue-600 rounded-xl p-3 mt-4 items-center">
            <Text className="text-white font-semibold">Generate {count} Entry Forms</Text>
          </TouchableOpacity>
        </Card>

        {entries.map((entry, idx) => (
          <Card key={entry.key} className="bg-slate-900 border-slate-800 mb-3">
            <View className="flex-row items-center justify-between mb-3">
              <View className="bg-orange-600 rounded-lg px-3 py-1">
                <Text className="text-white text-xs font-mono font-bold">{entry.key}</Text>
              </View>
              <Text className="text-slate-400 text-xs">#{idx + 1}</Text>
            </View>

            <Text className="text-slate-300 text-xs font-medium mb-1">Student Name</Text>
            <TextInput
              className="bg-slate-800 rounded-lg px-3 py-2.5 text-white text-sm border border-slate-700 mb-3"
              placeholder="Full name"
              placeholderTextColor="#64748b"
              value={entry.name}
              onChangeText={(v) => updateEntry(entry.key, 'name', v)}
            />

            <View className="flex-row gap-2 mb-3">
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-medium mb-1">Gender</Text>
                <View className="flex-row gap-1">
                  {GENDERS.map((g) => (
                    <TouchableOpacity
                      key={g}
                      onPress={() => updateEntry(entry.key, 'gender', g)}
                      className={`flex-1 py-2 rounded-lg ${entry.gender === g ? 'bg-orange-600' : 'bg-slate-800 border border-slate-700'}`}
                    >
                      <Text className={`text-xs text-center font-medium ${entry.gender === g ? 'text-white' : 'text-slate-300'}`}>{g[0]}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-medium mb-1">Admission</Text>
                <View className="flex-row gap-1">
                  {TYPES.map((t) => (
                    <TouchableOpacity
                      key={t}
                      onPress={() => updateEntry(entry.key, 'admissionType', t)}
                      className={`flex-1 py-2 rounded-lg ${entry.admissionType === t ? 'bg-orange-600' : 'bg-slate-800 border border-slate-700'}`}
                    >
                      <Text className={`text-[9px] text-center font-medium ${entry.admissionType === t ? 'text-white' : 'text-slate-300'}`}>{t}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            <View className="flex-row gap-2 mb-1">
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-medium mb-1">Student Phone</Text>
                <TextInput
                  className="bg-slate-800 rounded-lg px-3 py-2 text-white text-sm border border-slate-700"
                  placeholder="Phone"
                  placeholderTextColor="#64748b"
                  value={entry.phone}
                  onChangeText={(v) => updateEntry(entry.key, 'phone', v)}
                  keyboardType="phone-pad"
                  maxLength={10}
                />
              </View>
              <View className="flex-1">
                <Text className="text-slate-300 text-xs font-medium mb-1">Parent Phone</Text>
                <TextInput
                  className="bg-slate-800 rounded-lg px-3 py-2 text-white text-sm border border-slate-700"
                  placeholder="Parent phone"
                  placeholderTextColor="#64748b"
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
