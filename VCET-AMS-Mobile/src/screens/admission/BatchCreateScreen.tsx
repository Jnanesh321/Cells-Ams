import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import { useAdmissionStore } from '../../store/admissionStore';
import { generateBatchRollNumbers } from '../../mock/admission';
import Card from '../../components/Card';
import Input from '../../components/Input';

const DEPARTMENTS = ['CSE', 'ECE', 'AIML', 'MECH', 'CD', 'CV', 'ISE'];
const SECTIONS = ['A', 'B', 'C'];

export default function BatchCreateScreen() {
  const { batchForm, setBatchForm, createBatch, loadBatches } = useAdmissionStore();
  const [creating, setCreating] = useState(false);
  const [preview, setPreview] = useState<string[] | null>(null);

  const handlePreview = () => {
    const rolls = generateBatchRollNumbers(batchForm);
    setPreview(rolls.slice(0, 5));
  };

  const handleCreate = async () => {
    if (!batchForm.department) {
      Alert.alert('Validation', 'Please select a department');
      return;
    }
    if (!batchForm.year) {
      Alert.alert('Validation', 'Please select an admission year');
      return;
    }
    if (!batchForm.section) {
      Alert.alert('Validation', 'Please select a section');
      return;
    }
    if (batchForm.intakeSize < 1 || batchForm.intakeSize > 120) {
      Alert.alert('Validation', 'Intake size must be between 1 and 120');
      return;
    }
    setCreating(true);
    try {
      await createBatch();
      setPreview(null);
      Alert.alert('Success', `Batch ${batchForm.department} ${batchForm.year} Section ${batchForm.section} created with ${batchForm.intakeSize} seats`);
    } catch (e: any) {
      Alert.alert('Error', e.message ?? 'Failed to create batch');
    } finally {
      setCreating(false);
    }
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest mb-1">Admission Cell</Text>
        <Text className="text-white text-2xl font-bold mb-4">Create New Batch</Text>

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-base mb-4">Batch Configuration</Text>

          <Text className="text-slate-300 text-sm font-medium mb-2">Department</Text>
          <View className="flex-row flex-wrap gap-2 mb-4">
            {DEPARTMENTS.map((d) => (
              <TouchableOpacity
                key={d}
                onPress={() => setBatchForm('department', d)}
                className={`px-4 py-2 rounded-full ${batchForm.department === d ? 'bg-orange-600' : 'bg-slate-800'}`}
              >
                <Text className={`text-xs font-semibold ${batchForm.department === d ? 'text-white' : 'text-slate-300'}`}>{d}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-sm font-medium mb-2">Admission Year</Text>
          <View className="flex-row gap-2 mb-4">
            {[23, 24, 25].map((y) => (
              <TouchableOpacity
                key={y}
                onPress={() => setBatchForm('year', y)}
                className={`px-5 py-2 rounded-full ${batchForm.year === y ? 'bg-orange-600' : 'bg-slate-800'}`}
              >
                <Text className={`text-sm font-semibold ${batchForm.year === y ? 'text-white' : 'text-slate-300'}`}>20{y}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-sm font-medium mb-2">Section</Text>
          <View className="flex-row gap-2 mb-4">
            {SECTIONS.map((s) => (
              <TouchableOpacity
                key={s}
                onPress={() => setBatchForm('section', s)}
                className={`px-5 py-2 rounded-full ${batchForm.section === s ? 'bg-orange-600' : 'bg-slate-800'}`}
              >
                <Text className={`text-sm font-semibold ${batchForm.section === s ? 'text-white' : 'text-slate-300'}`}>Section {s}</Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text className="text-slate-300 text-sm font-medium mb-2">Intake Size</Text>
          <Input
            placeholder="e.g. 66"
            value={String(batchForm.intakeSize)}
            onChangeText={(v) => setBatchForm('intakeSize', parseInt(v) || 0)}
            className="bg-slate-800 border-slate-700 text-white"
          />
        </Card>

        <TouchableOpacity onPress={handlePreview} className="bg-slate-800 rounded-xl p-3 mb-4 border border-slate-700">
          <Text className="text-orange-400 text-sm font-semibold text-center">Preview Roll Numbers</Text>
        </TouchableOpacity>

        {preview && (
          <Card className="bg-slate-900 border-slate-800 mb-4">
            <Text className="text-white font-semibold text-sm mb-2">Sample Roll Numbers (first 5 of {batchForm.intakeSize})</Text>
            <View className="flex-row flex-wrap gap-2">
              {preview.map((r) => (
                <View key={r} className="bg-slate-800 rounded-lg px-3 py-1.5 border border-slate-700">
                  <Text className="text-orange-300 text-xs font-mono">{r}</Text>
                </View>
              ))}
            </View>
            <Text className="text-slate-500 text-xs mt-2">
              Format: {batchForm.year}{['CS','EC','AI','ME','CD','CV','IS'][DEPARTMENTS.indexOf(batchForm.department)]}001
            </Text>
          </Card>
        )}

        <TouchableOpacity
          onPress={handleCreate}
          disabled={creating}
          className="bg-orange-600 rounded-xl p-4 items-center mb-8"
        >
          <Text className="text-white font-bold text-base">{creating ? 'Creating...' : 'Create Batch'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
