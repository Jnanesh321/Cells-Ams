import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Card from '../components/Card';

const DEMO_ACCOUNTS = [
  {
    role: '👤 Student',
    accounts: [
      { id: '4VP21CS001', name: 'Aditya Kumar', password: 'vcet@123', detail: 'CSE • Sem 5 • Sec A' },
      { id: '4VP21CS002', name: 'Priya Sharma', password: 'vcet@123', detail: 'CSE • Sem 5 • Sec A' },
      { id: '4VP21CS008', name: 'Omkar Desai', password: 'vcet@123', detail: 'CSE • Sem 5 • Sec B' },
      { id: '4VP21EC001', name: 'Sneha Reddy', password: 'vcet@123', detail: 'ECE • Sem 5 • Sec A' },
    ],
    color: 'bg-blue-600',
  },
  {
    role: '👨‍🏫 Faculty',
    accounts: [
      { id: 'FAC_CSE_001', name: 'Mrs. Akshaya D. Shetty', password: 'faculty@123', detail: 'CSE • Assistant Professor' },
      { id: 'FAC_CSE_002', name: 'Mr. Ajay Shastry C G', password: 'faculty@123', detail: 'CSE • Assistant Professor' },
      { id: 'FAC_ECE_001', name: 'Mr. Naveenakrishna P V', password: 'faculty@123', detail: 'ECE • Assistant Professor' },
    ],
    color: 'bg-green-600',
  },
  {
    role: '👔 HOD',
    accounts: [
      { id: 'HOD_CSE', name: 'Prof. Pradeep Kumar KG', password: 'hod@123', detail: 'CSE • Head of Department' },
    ],
    color: 'bg-purple-600',
  },
  {
    role: '🎓 Principal',
    accounts: [
      { id: 'PRINCIPAL', name: 'Dr. Mahesh Prasanna K', password: 'principal@123', detail: 'Principal • VCET Puttur' },
    ],
    color: 'bg-amber-600',
  },
  {
    role: '⚙️ Admin',
    accounts: [
      { id: 'ADMIN', name: 'Admin User', password: 'admin@123', detail: 'System Administrator' },
    ],
    color: 'bg-red-600',
  },
  {
    role: '👨‍👩‍👦 Parent',
    accounts: [
      { id: 'PARENT01', name: 'Mr. Arjun Patel', password: 'parent@123', detail: 'Ward: 4VP21CS001' },
      { id: 'Student USN', name: 'Login with USN in Staff tab', password: 'parent@123', detail: 'e.g., 4VP21CS001 (parent@123)' },
    ],
    color: 'bg-cyan-600',
  },
  {
    role: '📋 Admission Cell',
    accounts: [
      { id: 'ADMISSION', name: 'Ms. Anitha K', password: 'admission@123', detail: 'Admission Officer' },
    ],
    color: 'bg-orange-600',
  },
];

export default function DemoCredentialsScreen() {
  const navigation = useNavigation<any>();

  return (
    <ScrollView className="flex-1 bg-slate-950">
      <View className="p-4 pb-8">
        <View className="flex-row items-center justify-between mb-4">
          <View>
            <Text className="text-slate-400 text-xs uppercase tracking-widest">VCET AMS</Text>
            <Text className="text-white text-2xl font-bold mt-1">Demo Credentials</Text>
            <Text className="text-slate-400 text-sm mt-1">
              Use these accounts to explore all features
            </Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} className="bg-slate-800 px-4 py-2 rounded-lg border border-slate-700">
            <Text className="text-white text-sm font-medium">Close</Text>
          </TouchableOpacity>
        </View>

        <Card className="bg-amber-900/30 border border-amber-800/60 mb-4">
          <Text className="text-amber-300 text-sm font-semibold">⚠️ Demo Mode</Text>
          <Text className="text-amber-200 text-xs mt-1 leading-5">
            This is a demonstration system. All data shown is sample data for presentation purposes. 
            No real student or faculty data is stored. Passwords shown here are for demo convenience only.
          </Text>
        </Card>

        {DEMO_ACCOUNTS.map((group) => (
          <View key={group.role} className="mb-4">
            <Text className="text-slate-300 text-sm font-semibold mb-2 ml-1">{group.role}</Text>
            {group.accounts.map((acc) => (
              <Card key={acc.id} className="bg-slate-900 border-slate-800 mb-2">
                <View className="flex-row items-center">
                  <View className={`w-10 h-10 ${group.color} rounded-full items-center justify-center mr-3`}>
                    <Text className="text-white text-xs font-bold">
                      {acc.name.split(' ').map((s) => s[0]).join('').slice(0, 2)}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-white font-medium text-sm">{acc.name}</Text>
                    <Text className="text-slate-400 text-xs">{acc.detail}</Text>
                    <View className="flex-row items-center mt-1 gap-2">
                      <View className="bg-slate-800 rounded px-2 py-0.5">
                        <Text className="text-blue-300 text-[10px] font-mono">{acc.id}</Text>
                      </View>
                      <View className="bg-slate-800 rounded px-2 py-0.5">
                        <Text className="text-green-300 text-[10px] font-mono">{acc.password}</Text>
                      </View>
                    </View>
                  </View>
                </View>
              </Card>
            ))}
          </View>
        ))}

        <Card className="bg-slate-900 border-slate-800 mb-4">
          <Text className="text-slate-300 font-semibold text-sm mb-2">Sample Student USNs</Text>
          <Text className="text-slate-400 text-xs leading-5">
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

        <Card className="bg-slate-900 border-slate-800">
          <Text className="text-slate-300 font-semibold text-sm mb-2">Quick Tips</Text>
          <Text className="text-slate-400 text-xs leading-5">
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
