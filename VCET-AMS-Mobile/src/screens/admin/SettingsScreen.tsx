import React, { useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View, Alert } from 'react-native';
import Card from '../../components/Card';

const settingsGroups = [
  {
    title: 'Academic Configuration',
    items: [
      { id: 'semester', label: 'Current Semester', value: '5 (Odd Sem 2024-25)', icon: '📚' },
      { id: 'attendance-threshold', label: 'Attendance Threshold', value: '75%', icon: '📊' },
      { id: 'max-ia-marks', label: 'Max IA Marks', value: '30', icon: '📝' },
    ],
  },
  {
    title: 'System Configuration',
    items: [
      { id: 'backup', label: 'Auto Backup Interval', value: 'Every 6 hours', icon: '💾' },
      { id: 'retention', label: 'Data Retention', value: '5 years', icon: '🗄️' },
      { id: 'session-timeout', label: 'Session Timeout', value: '60 minutes', icon: '⏱️' },
    ],
  },
  {
    title: 'Notifications',
    items: [
      { id: 'email', label: 'Email Notifications', value: 'Enabled', icon: '📧' },
      { id: 'sms', label: 'SMS Alerts', value: 'Disabled', icon: '📱' },
    ],
  },
];

export default function AdminSettingsScreen() {
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

        {settingsGroups.map((group) => (
          <Card key={group.title} className="bg-slate-900 border-slate-800 mb-4">
            <Text className="text-white font-bold text-base mb-3">{group.title}</Text>
            {group.items.map((item) => (
              <View key={item.id} className="flex-row items-center py-3 border-b border-slate-800 last:border-0">
                <Text className="text-lg mr-3">{item.icon}</Text>
                <View className="flex-1">
                  <Text className="text-white text-sm">{item.label}</Text>
                </View>
                <Text className="text-slate-400 text-xs">{item.value}</Text>
              </View>
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
    </ScrollView>
  );
}
