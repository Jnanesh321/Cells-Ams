import React, { useState } from 'react';
import { View, Text, Alert, KeyboardAvoidingView, Platform, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAuthStore } from '../store/auth';
import { useAppTheme } from '../hooks/useAppTheme';
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
  const { colors } = useAppTheme();
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

    setDebugMsg('trying backend...');
    try {
      const response = await api.post('/auth/login', { usn: trimmedId, password });
      const data = response.data;
      const token = data.accessToken;
      const refreshToken = data.refreshToken ?? null;
      const user = data.user;
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
        <View style={{ backgroundColor: colors.bgSecondary, padding: 8, marginBottom: 8, borderRadius: 6 }}>
          <Text style={{ color: colors.success, fontSize: 11, fontFamily: 'monospace' }}>
            isAuth: {String(isAuthenticated)} | role: {userRole ?? 'none'}
          </Text>
          <Text style={{ color: colors.warning, fontSize: 11, fontFamily: 'monospace' }}>
            lastLog: {debugMsg}
          </Text>
        </View>
      )}
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      className="flex-1"
      style={{ backgroundColor: colors.bg }}
    >
      <View className="flex-1 justify-center items-center p-6">
        <View className="mb-6 items-center">
          <Text className="text-4xl font-bold mb-2" style={{ color: colors.text }}>VCET AMS</Text>
          <Text className="text-lg" style={{ color: colors.textSecondary }}>Academic Monitoring System</Text>
        </View>

        <View className="w-full rounded-xl p-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-2xl font-bold mb-6 text-center" style={{ color: colors.text }}>Login</Text>

          {/* Login Mode Tabs */}
          <View className="flex-row rounded-xl p-1 mb-6" style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border, borderWidth: 1 }}>
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
                    loginTab === tab.key ? 'text-white' : ''
                  }`}
                  style={{ color: loginTab === tab.key ? '#FFFFFF' : colors.textMuted }}
                >
                  {tab.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View className="mb-4">
            <Text className="mb-2 font-medium" style={{ color: colors.textSecondary }}>
              {loginTab === 'student' ? 'USN' : 'User ID / USN'}
            </Text>
            <Input
              placeholder={loginTab === 'student' ? 'e.g., 4VP21CS001' : 'e.g., FAC_CSE_001 or ADMIN'}
              value={userId}
              onChangeText={(text) => setUserId(text.toUpperCase())}
              autoCapitalize="characters"
            />
            {loginTab === 'staff' && (
              <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
                Faculty: FAC_CSE_001 | Admin: ADMIN | Principal: PRINCIPAL | HOD: HOD_CSE | Parent: PARENT01 (or student USN) | Admission: ADMISSION
              </Text>
            )}
            {loginTab === 'student' && (
              <Text className="text-xs mt-1" style={{ color: colors.textMuted }}>
                Enter your VTU USN (e.g., 4VP21CS001)
              </Text>
            )}
          </View>

          <View className="mb-6">
            <Text className="mb-2 font-medium" style={{ color: colors.textSecondary }}>Password</Text>
            <Input
              placeholder="Enter password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <Button
            title={loading ? "Logging in..." : "Login"}
            onPress={handleLogin}
            disabled={loading}
            className="mb-3"
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('DemoCredentials')}
            className="rounded-xl py-3 items-center mb-4"
            style={{ backgroundColor: colors.bgInput, borderColor: colors.border, borderWidth: 1 }}
          >
            <Text className="text-sm font-medium" style={{ color: colors.textSecondary }}>📋 View Demo Credentials</Text>
          </TouchableOpacity>

          <View className="pt-4" style={{ borderTopWidth: 1, borderTopColor: colors.border }}>
            <Text className="font-semibold mb-3 text-center" style={{ color: colors.textMuted }}>Demo Credentials</Text>
            <View className="space-y-2">
              <Text className="text-xs" style={{ color: colors.textTertiary }}>👤 Student: 4VP21CS001</Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>👨‍🏫 Faculty: FAC_CSE_001</Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>👔 HOD: HOD_CSE</Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>🎓 Principal: PRINCIPAL</Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>⚙️ Admin: ADMIN</Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>👨‍👩‍👦 Parent: PARENT01 or Student USN (Staff tab)</Text>
              <Text className="text-xs" style={{ color: colors.textTertiary }}>📋 Admission: ADMISSION</Text>
            </View>
          </View>
        </View>

        <Text className="text-sm mt-8 text-center" style={{ color: colors.textMuted }}>
          VCET Puttur - Academic Monitoring System
        </Text>
      </View>
    </KeyboardAvoidingView>
    </>
  );
};

export default LoginScreen;
