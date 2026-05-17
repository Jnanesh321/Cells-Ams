import React, { useMemo } from 'react';
import { Text, View } from 'react-native';
import { getTodaysBirthdays } from '../mock/birthdays';

export default function BirthdayBanner() {
  const birthdays = useMemo(() => getTodaysBirthdays(), []);

  if (birthdays.length === 0) return null;

  return (
    <View className="bg-gradient-to-r from-pink-700 to-rose-700 rounded-xl p-3 mx-4 mb-3">
      <View className="flex-row items-center gap-2">
        <Text className="text-2xl">🎂</Text>
        <View className="flex-1">
          <Text className="text-pink-100 text-xs font-semibold uppercase tracking-wider">
            Birthday {birthdays.length > 1 ? 's' : ''} Today
          </Text>
          {birthdays.map((b) => (
            <Text key={b.usn} className="text-white font-bold text-sm">
              {b.name} {b.department ? `• ${b.department}` : ''}
            </Text>
          ))}
        </View>
      </View>
    </View>
  );
}
