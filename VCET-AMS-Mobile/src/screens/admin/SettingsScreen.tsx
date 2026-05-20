import React, { useState } from 'react';
import { ScrollView, Text, TextInput, TouchableOpacity, View, Alert, Modal, Switch } from 'react-native';
import { useAppTheme } from '../../hooks/useAppTheme';
import { useSettingsStore } from '../../store/settingsStore';
import Card from '../../components/Card';

type SettingGroup = {
  title: string;
  items: {
    id: string;
    label: string;
    icon: string;
    placeholder: string;
    isToggle?: boolean;
  }[];
};

export default function AdminSettingsScreen() {
  const { colors, isDark, toggleTheme } = useAppTheme();
  const settings = useSettingsStore((s) => s.settings);
  const updateSetting = useSettingsStore((s) => s.updateSetting);
  const resetSettings = useSettingsStore((s) => s.resetSettings);

  const settingGroups: SettingGroup[] = [
    {
      title: 'Academic Configuration',
      items: [
        { id: 'currentSemester', label: 'Current Semester', icon: '📚', placeholder: 'e.g., 5 (Odd Sem 2024-25)' },
        { id: 'attendanceThreshold', label: 'Attendance Threshold (%)', icon: '📊', placeholder: 'e.g., 75' },
        { id: 'iaMaxMarks', label: 'Max IA Marks', icon: '📝', placeholder: 'e.g., 50' },
      ],
    },
    {
      title: 'System Configuration',
      items: [
        { id: 'autoBackupInterval', label: 'Auto Backup Interval', icon: '💾', placeholder: 'e.g., Every 6 hours' },
        { id: 'dataRetention', label: 'Data Retention', icon: '🗄️', placeholder: 'e.g., 5 years' },
        { id: 'sessionTimeout', label: 'Session Timeout', icon: '⏱️', placeholder: 'e.g., 60 minutes' },
      ],
    },
    {
      title: 'Notifications',
      items: [
        { id: 'emailNotifications', label: 'Email Notifications', icon: '📧', placeholder: '', isToggle: true },
        { id: 'smsAlerts', label: 'SMS Alerts', icon: '📱', placeholder: '', isToggle: true },
      ],
    },
  ];

  const [editModal, setEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState<{ id: string; label: string; placeholder: string } | null>(null);
  const [editValue, setEditValue] = useState('');

  const openEdit = (item: SettingGroup['items'][number]) => {
    if (item.isToggle) return;
    const currentVal = String(settings[item.id as keyof typeof settings] ?? '');
    setEditingItem(item);
    setEditValue(currentVal);
    setEditModal(true);
  };

  const saveEdit = () => {
    if (!editingItem) return;
    const key = editingItem.id as keyof typeof settings;
    const currentVal = settings[key];
    const parsed = typeof currentVal === 'number' ? Number(editValue) : editValue;
    updateSetting(key, parsed as any);
    setEditModal(false);
    setEditingItem(null);
  };

  const handleReset = () => {
    Alert.alert(
      'Reset System',
      'This will clear all cached data and reset system settings to default. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Reset', style: 'destructive', onPress: () => { resetSettings(); Alert.alert('Success', 'System reset initiated'); } },
      ]
    );
  };

  const getDisplayValue = (id: string): string => {
    const val = settings[id as keyof typeof settings];
    if (typeof val === 'boolean') return val ? 'Enabled' : 'Disabled';
    if (id === 'attendanceThreshold') return `${val}%`;
    return String(val);
  };

  const toggleNotification = (id: string) => {
    updateSetting(id as keyof typeof settings, !(settings[id as keyof typeof settings] as boolean));
  };

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Administration</Text>
        <Text className="text-2xl font-bold mt-1 mb-4" style={{ color: colors.text }}>System Settings</Text>

        {settingGroups.map((group) => (
          <Card key={group.title} className="mb-4">
            <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>{group.title}</Text>
            {group.items.map((item) => (
              item.isToggle ? (
                <View
                  key={item.id}
                  className="flex-row items-center py-3 last:border-0"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                >
                  <Text className="text-lg mr-3">{item.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-sm" style={{ color: colors.text }}>{item.label}</Text>
                  </View>
                  <Switch
                    value={settings[item.id as keyof typeof settings] as boolean}
                    onValueChange={() => toggleNotification(item.id)}
                    trackColor={{ false: colors.border, true: colors.accentAdmin }}
                    thumbColor="#FFFFFF"
                  />
                </View>
              ) : (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => openEdit(item)}
                  className="flex-row items-center py-3 last:border-0"
                  style={{ borderBottomWidth: 1, borderBottomColor: colors.borderLight }}
                >
                  <Text className="text-lg mr-3">{item.icon}</Text>
                  <View className="flex-1">
                    <Text className="text-sm" style={{ color: colors.text }}>{item.label}</Text>
                  </View>
                  <Text className="text-xs mr-2" style={{ color: colors.textMuted }}>{getDisplayValue(item.id)}</Text>
                  <Text className="text-xs" style={{ color: colors.textMuted }}>✎</Text>
                </TouchableOpacity>
              )
            ))}
          </Card>
        ))}

        <Card className="mb-4">
          <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Appearance</Text>
          <View className="flex-row items-center justify-between py-2">
            <View>
              <Text className="font-medium" style={{ color: colors.text }}>Dark Mode</Text>
              <Text className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                {isDark ? 'Dark theme active' : 'Light theme active'}
              </Text>
            </View>
            <Switch
              value={isDark}
              onValueChange={toggleTheme}
              trackColor={{ false: colors.border, true: colors.accentAdmin }}
              thumbColor={isDark ? '#FFFFFF' : '#F4F3F4'}
            />
          </View>
        </Card>

        <Card className="mb-4">
          <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>Danger Zone</Text>
          <TouchableOpacity onPress={handleReset} className="bg-red-900/50 rounded-xl p-4 border border-red-800/60">
            <Text className="text-red-300 font-semibold">Reset System Settings</Text>
            <Text className="text-red-400 text-xs mt-1">This action will revert all settings to default values</Text>
          </TouchableOpacity>
        </Card>

        <Card className="mb-6">
          <Text className="font-bold text-base mb-3" style={{ color: colors.text }}>About</Text>
          <View className="space-y-2">
            <View className="flex-row justify-between"><Text className="text-sm" style={{ color: colors.textMuted }}>App Version</Text><Text className="text-sm" style={{ color: colors.text }}>1.0.0</Text></View>
            <View className="flex-row justify-between"><Text className="text-sm" style={{ color: colors.textMuted }}>Build</Text><Text className="text-sm" style={{ color: colors.text }}>2026.05.14</Text></View>
            <View className="flex-row justify-between"><Text className="text-sm" style={{ color: colors.textMuted }}>Environment</Text><Text className="text-sm" style={{ color: colors.text }}>Production</Text></View>
            <View className="flex-row justify-between"><Text className="text-sm" style={{ color: colors.textMuted }}>College</Text><Text className="text-sm" style={{ color: colors.text }}>VCET Puttur</Text></View>
          </View>
        </Card>
      </View>

      <Modal visible={editModal} animationType="fade" transparent>
        <View className="flex-1 justify-center px-6" style={{ backgroundColor: colors.overlay }}>
          <View className="rounded-2xl p-5" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-lg font-bold mb-1" style={{ color: colors.text }}>Edit Setting</Text>
            <Text className="text-sm mb-4" style={{ color: colors.textMuted }}>{editingItem?.label}</Text>

            <TextInput
              className="rounded-xl px-4 py-3 mb-4"
              style={{ backgroundColor: colors.bgInput, color: colors.text, borderColor: colors.border, borderWidth: 1 }}
              value={editValue}
              onChangeText={setEditValue}
              placeholder={editingItem?.placeholder ?? ''}
              placeholderTextColor={colors.placeholder}
              autoFocus
            />

            <View className="flex-row gap-3">
              <TouchableOpacity onPress={() => setEditModal(false)} className="flex-1 rounded-xl py-3 items-center" style={{ backgroundColor: colors.bgTertiary }}>
                <Text className="font-semibold" style={{ color: colors.text }}>Cancel</Text>
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
