import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import { User, UserRole } from '../types';
import { mockUsers, isStudentUSN, mockStudents } from '../mock';

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { setToken, setUser } = useAuthStore();

  const handleLogin = async () => {
    if (!userId || !password) {
      Alert.alert('Error', 'Please enter both ID and password.');
      return;
    }

    setLoading(true);

    try {
      const trimmedId = userId.trim().toUpperCase();
      const trimmedPassword = password.trim();

      let user: any = null;
      let role: UserRole | null = null;

      // Check if it's a student USN
      if (isStudentUSN(trimmedId)) {
        const student = mockStudents.find(s => s.usn === trimmedId);
        if (student && student.password === trimmedPassword) {
          user = {
            usn: student.usn,
            id: student.usn,
            role: 'STUDENT',
            name: student.name,
            email: student.email,
            phone: student.phone,
            section: student.section,
            department: student.department,
            year: student.year,
            semester: student.semester,
            gpa: student.gpa,
            academicStatus: student.academicStatus,
            departmentId: null,
          };
          role = 'STUDENT';
        } else {
          throw new Error('Invalid student credentials');
        }
      } else {
        // Check if it's a staff member
        const staffUser = mockUsers[trimmedId as keyof typeof mockUsers];
        if (staffUser && staffUser.password === trimmedPassword) {
          user = {
            id: staffUser.id,
            usn: (staffUser as any).usn ?? staffUser.id,
            role: staffUser.role,
            name: staffUser.name,
            email: staffUser.email,
            phone: (staffUser as any).phone,
            department: (staffUser as any).department,
            designation: (staffUser as any).designation,
            departmentId: (staffUser as any).departmentId ?? null,
            section: null,
          };
          role = staffUser.role;
        } else {
          throw new Error('Invalid credentials');
        }
      }

      if (!user || !role) {
        throw new Error('Invalid credentials');
      }

      // Simulate token generation
      const token = `token_${trimmedId}_${Date.now()}`;
      setToken(token);
      setUser(user);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message || 'Invalid credentials. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      className="flex-1 bg-slate-900"
    >
      <View className="flex-1 justify-center items-center p-6">
        <View className="mb-8 items-center">
          <Text className="text-4xl font-bold text-white mb-2">VCET AMS</Text>
          <Text className="text-lg text-slate-400">Academic Monitoring System</Text>
        </View>

        <View className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700">
          <Text className="text-2xl font-bold text-white mb-6 text-center">Login</Text>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">User ID / USN</Text>
            <Input
              placeholder="e.g., 4VP21CS001 or ADMIN"
              value={userId}
              onChangeText={(text) => setUserId(text.toUpperCase())}
              autoCapitalize="characters"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
              <Text className="text-xs text-slate-500 mt-1">
                Student: VTU USN | Faculty: FAC_CSE_001 | Admin: ADMIN | Principal: PRINCIPAL | HOD: HOD_CSE | Parent: PARENT01 | Admission: ADMISSION
              </Text>
          </View>

          <View className="mb-6">
            <Text className="text-slate-300 mb-2 font-medium">Password</Text>
            <Input
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
          </View>

          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            className="bg-blue-600 active:bg-blue-700 mb-3"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('DemoCredentials')}
            className="bg-slate-700 rounded-xl py-3 items-center mb-4 border border-slate-600"
          >
            <Text className="text-slate-300 text-sm font-medium">📋 View Demo Credentials</Text>
          </TouchableOpacity>

          <View className="pt-4 border-t border-slate-700">
            <Text className="text-slate-400 font-semibold mb-3 text-center">Demo Credentials</Text>
            <View className="space-y-2">
              <Text className="text-slate-500 text-xs">👤 Student: 4VP21CS001 (vcet@123)</Text>
              <Text className="text-slate-500 text-xs">👨‍🏫 Faculty: FAC_CSE_001 (faculty@123)</Text>
              <Text className="text-slate-500 text-xs">👔 HOD: HOD_CSE (hod@123)</Text>
              <Text className="text-slate-500 text-xs">🎓 Principal: PRINCIPAL (principal@123)</Text>
              <Text className="text-slate-500 text-xs">⚙️ Admin: ADMIN (admin@123)</Text>
              <Text className="text-slate-500 text-xs">👨‍👩‍👦 Parent: PARENT01 (parent@123)</Text>
              <Text className="text-slate-500 text-xs">📋 Admission: ADMISSION (admission@123)</Text>
            </View>
          </View>
        </View>

        <Text className="text-slate-600 text-sm mt-8 text-center">
          VCET Puttur - Academic Monitoring System
        </Text>
      </View>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;
