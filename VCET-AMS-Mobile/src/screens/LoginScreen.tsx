import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import Input from '../components/Input';
import Button from '../components/Button';
import { UserRole } from '../types';
import { mockUsers, isStudentUSN, mockStudents, getMockUser } from '../mock';
import api from '../services/api';

function buildUserObject(id: string, source: any): { user: any; role: UserRole } {
  const user = {
    id: source.id,
    usn: (source as any).usn ?? source.id,
    role: source.role,
    name: source.name,
    email: source.email,
    phone: (source as any).phone,
    department: (source as any).department,
    designation: (source as any).designation,
    departmentId: (source as any).departmentId ?? null,
    section: null,
  };
  return { user, role: source.role as UserRole };
}

async function localAdminLogin(trimmedId: string, trimmedPassword: string) {
  const staffUser = mockUsers['ADMIN' as keyof typeof mockUsers];
  if (!staffUser || staffUser.password !== trimmedPassword) {
    throw new Error('Invalid admin credentials');
  }
  const token = `token_${trimmedId}_${Date.now()}`;
  const { user, role } = buildUserObject(trimmedId, staffUser);
  return { token, user, role };
}

async function backendLogin(trimmedId: string, trimmedPassword: string) {
  const API = (await import('../services/api')).default;
  const response = await API.post('/auth/login', {
    usn: trimmedId,
    password: trimmedPassword,
  });
  const data = response.data;
  const token = data.accessToken;
  const refreshToken = data.refreshToken ?? null;
  const role = data.role as UserRole;
  const user = {
    id: String(data.user?.id ?? trimmedId),
    usn: data.user?.usn ?? trimmedId,
    role,
    name: data.user?.name ?? '',
    email: data.user?.email ?? '',
    phone: data.user?.phone ?? '',
    department: data.user?.department ?? '',
    designation: data.user?.designation ?? '',
    departmentId: data.user?.departmentId ?? null,
    section: data.user?.section ?? null,
  };
  return { token, refreshToken, user, role };
}

function mockLogin(trimmedId: string, trimmedPassword: string) {
  if (isStudentUSN(trimmedId)) {
    const student = mockStudents.find(s => s.usn === trimmedId);
    if (!student || student.password !== trimmedPassword) {
      throw new Error('Invalid student credentials');
    }
    const user = {
      usn: student.usn,
      id: student.usn,
      role: 'STUDENT' as UserRole,
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
    const token = `token_${trimmedId}_${Date.now()}`;
    return { token, user, role: 'STUDENT' as UserRole };
  }

  const staffUser = mockUsers[trimmedId as keyof typeof mockUsers];
  if (!staffUser || staffUser.password !== trimmedPassword) {
    throw new Error('Invalid credentials');
  }
  const { user, role } = buildUserObject(trimmedId, staffUser);
  const token = `token_${trimmedId}_${Date.now()}`;
  return { token, user, role };
}

const LOGIN_TABS: { key: 'student' | 'staff'; label: string; icon: string }[] = [
  { key: 'student', label: 'Student', icon: '🎓' },
  { key: 'staff', label: 'Staff / Parent', icon: '👤' },
];

const LoginScreen = () => {
  const navigation = useNavigation<any>();
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loginTab, setLoginTab] = useState<'student' | 'staff'>('student');
  const [debugMsg, setDebugMsg] = React.useState('waiting...');
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const userRole = useAuthStore((s) => s.user?.role);
  const { setAuth } = useAuthStore();

  const handleLogin = async () => {
    setDebugMsg('handleLogin fired');

    if (!userId.trim() || !password.trim()) {
      setDebugMsg('validation failed');
      Alert.alert('Error', 'Please enter both User ID and password');
      return;
    }

    setLoading(true);

    const trimmedId = userId.trim().toUpperCase();

    if (trimmedId === 'ADMIN' && password === 'admin@123') {
      setDebugMsg('ADMIN path — calling setAuth');
      setAuth({
        usn: 'ADMIN',
        name: 'Admin User',
        role: 'ADMIN',
        token: 'local-admin-token',
        refreshToken: 'local-admin-refresh',
      });
      setDebugMsg('setAuth done — waiting for nav');
      setLoading(false);
      return;
    }

    setDebugMsg('trying backend...');
    try {
      const response = await api.post('/auth/login', { usn: trimmedId, password });
      const { token, refreshToken, user } = response.data.data;
      setDebugMsg(`backend ok: ${user.role}`);
      setAuth({ ...user, token, refreshToken });
    } catch (err: any) {
      setDebugMsg('backend failed — trying mock');
      const mockUser = getMockUser(trimmedId, password, loginTab);
      if (mockUser) {
        setDebugMsg(`mock ok: ${mockUser.role}`);
        setAuth(mockUser);
      } else {
        setDebugMsg('no mock match — bad credentials');
        Alert.alert('Login Failed', 'Invalid credentials. Please check your User ID and password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {__DEV__ && (
        <View style={{ backgroundColor: '#1a1a2e', padding: 8, marginBottom: 8, borderRadius: 6 }}>
          <Text style={{ color: '#00ff88', fontSize: 11, fontFamily: 'monospace' }}>
            isAuth: {String(isAuthenticated)} | role: {userRole ?? 'none'}
          </Text>
          <Text style={{ color: '#ffaa00', fontSize: 11, fontFamily: 'monospace' }}>
            lastLog: {debugMsg}
          </Text>
        </View>
      )}
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1 bg-slate-900"
    >
      <View className="flex-1 justify-center items-center p-6">
        <View className="mb-6 items-center">
          <Text className="text-4xl font-bold text-white mb-2">VCET AMS</Text>
          <Text className="text-lg text-slate-400">Academic Monitoring System</Text>
        </View>

        <View className="w-full bg-slate-800 rounded-xl p-6 border border-slate-700">
          <Text className="text-2xl font-bold text-white mb-6 text-center">Login</Text>

          {/* Login Mode Tabs */}
          <View className="flex-row bg-slate-900 rounded-xl p-1 mb-6 border border-slate-700">
            {LOGIN_TABS.map((tab) => (
              <TouchableOpacity
                key={tab.key}
                onPress={() => setLoginTab(tab.key)}
                className={`flex-1 py-2.5 rounded-lg items-center flex-row justify-center gap-1.5 ${
                  loginTab === tab.key ? 'bg-indigo-600' : ''
                }`}
              >
                <Text className="text-sm">{tab.icon}</Text>
                <Text
                  className={`text-sm font-semibold ${
                    loginTab === tab.key ? 'text-white' : 'text-slate-400'
                  }`}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-4">
            <Text className="text-slate-300 mb-2 font-medium">
              {loginTab === 'student' ? 'USN' : 'User ID / USN'}
            </Text>
            <Input
              placeholder={loginTab === 'student' ? 'e.g., 4VP21CS001' : 'e.g., FAC_CSE_001 or ADMIN'}
              value={userId}
              onChangeText={(text) => setUserId(text.toUpperCase())}
              autoCapitalize="characters"
              className="bg-slate-700 border-slate-600 text-white placeholder-slate-500"
            />
            {loginTab === 'staff' && (
              <Text className="text-xs text-slate-500 mt-1">
                Faculty: FAC_CSE_001 | Admin: ADMIN | Principal: PRINCIPAL | HOD: HOD_CSE | Parent: PARENT01 (or student USN) | Admission: ADMISSION
              </Text>
            )}
            {loginTab === 'student' && (
              <Text className="text-xs text-slate-500 mt-1">
                Enter your VTU USN (e.g., 4VP21CS001)
              </Text>
            )}
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
              <Text className="text-slate-500 text-xs">👨‍👩‍👦 Parent: PARENT01 (parent@123) or USN (parent@123) in Staff tab</Text>
              <Text className="text-slate-500 text-xs">📋 Admission: ADMISSION (admission@123)</Text>
            </View>
          </View>
        </View>

        <Text className="text-slate-600 text-sm mt-8 text-center">
          VCET Puttur - Academic Monitoring System
        </Text>
      </View>
    </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;
