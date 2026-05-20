import React, { useEffect, useMemo, useState } from 'react';
import { Alert, FlatList, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAdmissionStore } from '../../store/admissionStore';
import { useAppTheme } from '../../hooks/useAppTheme';
import { previewUSNMapping, mapRollToUSN } from '../../mock/admission';
import Card from '../../components/Card';
import Loader from '../../components/Loader';

export default function USNMappingScreen() {
  const { colors } = useAppTheme();
  const { batches, loadBatches, bulkMapUSN, loadStats } = useAdmissionStore();
  const [unmapped, setUnmapped] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [mappings, setMappings] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    await loadBatches();
    const { getUnmappedStudents } = await import('../../mock/admission');
    const list = await getUnmappedStudents();
    setUnmapped(list);
    const initial: Record<string, string> = {};
    list.forEach((s) => {
      initial[s.id] = s.mappedUSN ?? previewUSNMapping(s.rollNo, s.department);
    });
    setMappings(initial);
    setLoading(false);
  };

  useEffect(() => { void load(); }, []);

  const pendingCount = useMemo(() => unmapped.filter((s) => !s.mappedUSN).length, [unmapped]);

  const handleAutoMap = () => {
    const auto: Record<string, string> = {};
    unmapped.forEach((s) => {
      if (!s.mappedUSN) auto[s.id] = mapRollToUSN(s.rollNo);
    });
    setMappings((prev) => ({ ...prev, ...auto }));
  };

  const handleSave = async () => {
    const toSave = Object.entries(mappings)
      .filter(([id]) => unmapped.find((s) => s.id === id && !s.mappedUSN))
      .map(([draftId, usn]) => ({ draftId, usn: usn.trim().toUpperCase() }));

    const invalid = toSave.filter((m) => !/^\d{1}[A-Z]{2}\d{2}[A-Z]{2}\d{3}$/.test(m.usn));
    if (invalid.length > 0) {
      Alert.alert('Validation Error', `${invalid.length} USN(s) have invalid format. Expected format: 4VP24CS001`);
      return;
    }

    if (toSave.length === 0) {
      Alert.alert('Nothing to save', 'All selected students already have USNs mapped');
      return;
    }

    setSaving(true);
    const count = await bulkMapUSN(toSave);
    Alert.alert('Success', `${count} USNs mapped successfully`);
    await load();
    setSaving(false);
  };

  if (loading) return <Loader />;

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-2">
        <Text className="text-xs uppercase tracking-widest mb-1" style={{ color: colors.textMuted }}>Admission Cell</Text>
        <Text className="text-2xl font-bold" style={{ color: colors.text }}>USN Mapping</Text>
        <Text className="text-sm mt-1" style={{ color: colors.textMuted }}>{pendingCount} students pending mapping</Text>
      </View>

      <View className="flex-row px-4 gap-2 mb-4">
        <TouchableOpacity onPress={handleAutoMap} className="flex-1 bg-blue-600 rounded-xl p-3 items-center">
          <Text className="text-white font-semibold text-sm">Auto-Generate USNs</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={handleSave}
          disabled={saving}
          className="flex-1 bg-green-600 rounded-xl p-3 items-center"
        >
          <Text className="text-white font-semibold text-sm">{saving ? 'Saving...' : 'Save All Mappings'}</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        className="px-4"
        data={unmapped}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => {
          const isMapped = !!item.mappedUSN;
          return (
            <Card className="border mb-2" style={{ backgroundColor: colors.bgCard, borderColor: isMapped ? '#166534' : colors.border }}>
              <View className="flex-row items-center justify-between mb-2">
                <View className="flex-1">
                  <Text className="font-medium text-sm" style={{ color: colors.text }}>{item.name}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>{item.rollNo} • {item.department} • {item.admissionType}</Text>
                </View>
                {isMapped && (
                  <View className="rounded px-2 py-0.5" style={{ backgroundColor: 'rgba(22,163,74,0.5)' }}>
                    <Text className="text-green-300 text-[10px] font-medium">MAPPED</Text>
                  </View>
                )}
              </View>
              <View className="flex-row items-center gap-2">
                <View className="rounded-lg px-2 py-1" style={{ backgroundColor: colors.bgTertiary }}>
                  <Text className="text-orange-300 text-xs font-mono">{item.rollNo}</Text>
                </View>
                <Text style={{ color: colors.textMuted }}>→</Text>
                <TextInput
                  className="flex-1 rounded-lg px-3 py-2 text-sm font-mono"
                  style={{ backgroundColor: colors.bgTertiary, color: isMapped ? '#86efac' : colors.text, borderColor: isMapped ? '#166534' : colors.border, borderWidth: 1 }}
                  value={mappings[item.id] ?? ''}
                  onChangeText={(v) => setMappings((prev) => ({ ...prev, [item.id]: v.toUpperCase() }))}
                  editable={!isMapped}
                  autoCapitalize="characters"
                />
              </View>
              {!isMapped && (
                <Text className="text-[10px] mt-1" style={{ color: colors.textMuted }}>
                  Expected: {mapRollToUSN(item.rollNo)}
                </Text>
              )}
            </Card>
          );
        }}
        ListEmptyComponent={
          <Card style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm text-center" style={{ color: colors.textMuted }}>All students have been mapped</Text>
          </Card>
        }
      />
    </View>
  );
}
