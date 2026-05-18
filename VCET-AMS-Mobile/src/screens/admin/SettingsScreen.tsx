import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, Modal } from 'react-native';
import Card from '../../components/Card';

const defaultSettings = [
  {
    title: 'Academic Configuration',
    items: [
      { id: 'semester', label: 'Current Semester', value: '5 (Odd Sem 2024-25)', icon: '📚', placeholder: 'e.g., 5 (Odd Sem 2024-25)' },
      { id: 'attendance-threshold', label: 'Attendance Threshold', value: '75%', icon: '📊', placeholder: 'e.g., 75%' },
      { id: 'max-ia-marks', label: 'Max IA Marks', value: '30', icon: '📝', placeholder: 'e.g., 30' },
    ],
  },
  {
    title: 'System Configuration',
    items: [
      { id: 'backup', label: 'Auto Backup Interval', value: 'Every 6 hours', icon: '💾', placeholder: 'e.g., Every 6 hours' },
      { id: 'retention', label: 'Data Retention', value: '5 years', icon: '🗄️', placeholder: 'e.g., 5 years' },
      { id: 'session-timeout', label: 'Session Timeout', value: '60 minutes', icon: '⏱️', placeholder: 'e.g., 60 minutes' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'email', label: 'Email Notifications', value: 'Enabled', icon: '📧', placeholder: 'Enabled/Disabled' },
      { id: 'sms', label: 'SMS Alerts', value: 'Disabled', icon: '📱', placeholder: 'Enabled/Disabled' },
    ],
  },
];

export default function AdminSettingsScreen() {
  const [settings, setSettings] = useState(defaultSettings);
  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editValue, setEditValue] = useState('');

  const openEdit = (item: any) => {
    setEditingItem(item);
    setEditValue(item.value);
    setEditModal(true);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    setSettings((prev) =>
      prev.map((group) => ({
        ...group,
        items: group.items.map((item) =>
          item.id === editingItem.id ? { ...item, value: editValue } : item
        ),
      }))
    );
    setEditModal(false);
    setEditingItem(null);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset System',
      'This will clear all cached data and reset system settings to default. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => Alert.alert('Success', 'System reset initiated') },
      ]
    );
  };

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="p-4">
        <Text className="text-slate-400 text-xs uppercase tracking-widest">Administration</Text>
        <Text className="text-white text-2xl font-bold mt-1 mb-4">System Settings</Text>

        {settings.map((group) => (
          <Card key={group.title} className="bg-slate-900 border-slate-800 mb-4">
            <Text className="text-white font-bold text-base mb-3">{group.title}</Text>
            {group.items.map((item) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => openEdit(item)}
                className="flex-row items-center py-3 border-b border-slate-800 last:border-0"
              >
                <Text className="text-lg mr-3">{item.icon}</Text>
                <View className="flex-1">
                  <Text className="text-white text-sm">{item.label}</Text>
                </View>
                <Text className="text-slate-400 text-xs mr-2">{item.value}</Text>
                <Text className="text-slate-600 text-xs">✎</Text>
              </TouchableOpacity>
            ))}
          </Card>
        ))}

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-white font-bold text-base mb-3">Danger Zone</Text>
          <TouchableOpacity onPress={handleReset} className="bg-red-900/50 rounded-xl p-4 border border-red-800/60">
            <Text className="text-red-300 font-semibold">Reset System Settings</Text>
            <Text className="text-red-400 text-xs mt-1">This action will revert all settings to default values</Text>
          </TouchableOpacity>
        </Card>

        <Card className="bg-slate-900 border-slate-800 mb-6">
          <Text className="text-white font-bold text-base mb-3">About</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between"><Text className="text-slate-400 text-sm">App Version</Text><Text className="text-white text-sm">1.0.0</Text></View>
            <View className="flex-row justify-between"><Text className="text-slate-400 text-sm">Build</Text><Text className="text-white text-sm">2026.05.14</Text></View>
            <View className="flex-row justify-between"><Text className="text-slate-400 text-sm">Environment</Text><Text className="text-white text-sm">Production</Text></View>
            <View className="flex-row justify-between"><Text className="text-slate-400 text-sm">College</Text><Text className="text-white text-sm">VCET Puttur</Text></View>
          </View>
        </Card>
      </View>

      <Modal visible={editModal} animationType="fade" transparent>
        <View className="flex-1 bg-black/60 justify-center px-6">
          <View className="bg-slate-900 rounded-2xl p-5 border border-slate-700">
            <Text className="text-white text-lg font-bold mb-1">Edit Setting</Text>
            <Text className="text-slate-400 text-sm mb-4">{editingItem?.label}</Text>

            <TextInput
              className="bg-slate-800 text-white rounded-xl px-4 py-3 border border-slate-700 mb-4"
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editingItem?.placeholder ?? ''}
              placeholderTextColor="#64748b"
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setEditModal(false)} className="flex-1 bg-slate-700 rounded-xl py-3 items-center">
                <Text className="text-white font-semibold">Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveEdit} className="flex-1 bg-blue-600 rounded-xl py-3 items-center">
                <Text className="text-white font-semibold">Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}
