import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAppTheme } from '../hooks/useAppTheme';
import Card from '../components/Card';

const DEMO_ACCOUNTS = [
  {
    role: '👤 Student',
    accounts: [
      { id: '4VP21CS001', name: 'Aditya Kumar', detail: 'CSE • Sem 5 • Sec A' },
      { id: '4VP21CS002', name: 'Priya Sharma', detail: 'CSE • Sem 5 • Sec A' },
      { id: '4VP21CS008', name: 'Omkar Desai', detail: 'CSE • Sem 5 • Sec B' },
      { id: '4VP21EC001', name: 'Sneha Reddy', detail: 'ECE • Sem 5 • Sec A' },
    ],
    color: 'bg-blue-600',
  },
  {
    role: '👨‍🏫 Faculty',
    accounts: [
      { id: 'FAC_CSE_001', name: 'Mrs. Akshaya D. Shetty', detail: 'CSE • Assistant Professor' },
      { id: 'FAC_CSE_002', name: 'Mr. Ajay Shastry C G', detail: 'CSE • Assistant Professor' },
      { id: 'FAC_ECE_001', name: 'Mr. Naveenakrishna P V', detail: 'ECE • Assistant Professor' },
    ],
    color: 'bg-green-600',
  },
  {
    role: '👔 HOD',
    accounts: [
      { id: 'HOD_CSE', name: 'Prof. Pradeep Kumar KG', detail: 'CSE • Head of Department' },
    ],
    color: 'bg-purple-600',
  },
  {
    role: '🎓 Principal',
    accounts: [
      { id: 'PRINCIPAL', name: 'Dr. Mahesh Prasanna K', detail: 'Principal • VCET Puttur' },
    ],
    color: 'bg-amber-600',
  },
  {
    role: '⚙️ Admin',
    accounts: [
      { id: 'ADMIN', name: 'Admin User', detail: 'System Administrator' },
    ],
    color: 'bg-red-600',
  },
  {
    role: '👨‍👩‍👦 Parent',
    accounts: [
      { id: 'PARENT01', name: 'Mr. Arjun Patel', detail: 'Ward: 4VP21CS001' },
      { id: 'Student USN', name: 'Login with USN in Staff tab', detail: 'e.g., 4VP21CS001 (parent@123)' },
    ],
    color: 'bg-cyan-600',
  },
  {
    role: '📋 Admission Cell',
    accounts: [
      { id: 'ADMISSION', name: 'Ms. Anitha K', detail: 'Admission Officer' },
    ],
    color: 'bg-orange-600',
  },
];

export default function DemoCredentialsScreen() {
  const navigation = useNavigation<any>();
  const { colors } = useAppTheme();

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>VCET AMS</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>Demo Credentials</Text>
            <Text className="text-sm mt-1" style={{ color: colors.textSecondary }}>
              Use these accounts to explore all features
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} className="px-4 py-2 rounded-lg" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
            <Text className="text-sm font-medium" style={{ color: colors.text }}>Close</Text>
          </TouchableOpacity>
        </View>

        <Card className="mb-4" style={{ backgroundColor: '#451A03', borderColor: '#92400E', borderWidth: 1 }}>
          <Text className="text-amber-300 text-sm font-semibold">⚠️ Demo Mode</Text>
          <Text className="text-amber-200 text-xs mt-1 leading-5">
            This is a demonstration system. All data shown is sample data for presentation purposes.
            Use the credentials provided by your institution to log in.
          </Text>
        </Card>

        {DEMO_ACCOUNTS.map((group) => (
          <View key={group.role} className="mb-4">
            <Text className="text-sm font-semibold mb-2 ml-1" style={{ color: colors.textSecondary }}>{group.role}</Text>
            {group.accounts.map((acc) => (
              <Card key={acc.id} className="mb-2">
                <View className="flex-row items-center">
                  <View className={`w-10 h-10 ${group.color} rounded-full items-center justify-center mr-3`}>
                    <Text className="text-white text-xs font-bold">
                      {acc.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="font-medium text-sm" style={{ color: colors.text }}>{acc.name}</Text>
                    <Text className="text-xs" style={{ color: colors.textMuted }}>{acc.detail}</Text>
                    <View className="flex-row items-center mt-1">
                      <View className="rounded px-2 py-0.5" style={{ backgroundColor: colors.bgTertiary }}>
                        <Text className="text-[10px]" style={{ color: colors.accentStudent }}>{acc.id}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ))}

        <Card className="mb-4">
          <Text className="font-semibold text-sm mb-2" style={{ color: colors.textSecondary }}>Sample Student USNs</Text>
          <Text className="text-xs leading-5" style={{ color: colors.textMuted }}>
            4VP21CS001 - Aditya Kumar{'\n'}
            4VP21CS002 - Priya Sharma{'\n'}
            4VP21CS003 - Rajesh Patel{'\n'}
            4VP21CS004 - Meera Iyer{'\n'}
            4VP21CS005 - Rohan Pillai{'\n'}
            4VP21EC001 - Sneha Reddy{'\n'}
            4VP21EC002 - Arjun Nair{'\n'}
            4VP21EC003 - Kavya Singh
          </Text>
        </Card>

        <Card className="mb-4">
          <Text className="font-semibold text-sm mb-2" style={{ color: colors.textSecondary }}>Quick Tips</Text>
          <Text className="text-xs leading-5" style={{ color: colors.textMuted }}>
            1. Login with any demo account above{'\n'}
            2. Each role has a unique dashboard{'\n'}
            3. Faculty can mark attendance & IA marks{'\n'}
            4. HOD can view shortage & detained students{'\n'}
            5. Principal can view college-wide analytics{'\n'}
            6. Admission Cell can create batches & map USNs{'\n'}
            7. Parent can monitor ward's progress
          </Text>
        </Card>
      </View>
    </ScrollView>
  );
}
