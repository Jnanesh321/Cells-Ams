import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ScrollView, Text, TextInput, TouchableOpacity, View, ActivityIndicator, Alert,
} from 'react-native';
import { useAuthStore } from '../../store/auth';
import { useAppTheme } from '../../hooks/useAppTheme';
import API from '../../services/api';
import Card from '../../components/Card';
import NotificationBell from '../../components/NotificationBell';

type StudentProfile = {
  usn: string; name: string; email: string | null;
  department: { name: string; code: string } | null;
  semester: string; section: string; batch: string; dateOfBirth: string | null;
  fatherName: string | null; motherName: string | null;
  fatherOccupation: string | null; motherOccupation: string | null;
  fatherPhone: string | null; motherPhone: string | null;
  studentPhone: string | null;
  permanentAddress: string | null; currentAddress: string | null;
  bloodGroup: string | null; nationality: string | null;
  religion: string | null; category: string | null;
  tenthMarks: number | null; tenthBoard: string | null; tenthPassYear: number | null;
  pucMarks: number | null; pucBoard: string | null; pucPassYear: number | null;
  cetRank: number | null; cetScore: number | null; diplomaMarks: number | null;
  hobbies: string | null; achievements: string | null;
  isLateralEntry: boolean; admissionType: string | null; photoUrl: string | null;
  attendance: Array<{ subjectCode: string; present: number; total: number; percent: number }>;
  cieSummaries: Array<{ subjectCode: string; subjectName: string; cieTotal: number; isEligible: boolean; finalized: boolean }>;
  detention: { isDetained: boolean; exempted: boolean; reasons: string[] } | null;
};

type SectionKey = 'personal' | 'family' | 'education' | 'academic' | 'settings';

export default function StudentProfileScreen() {
  const { user, logout } = useAuthStore();
  const { colors } = useAppTheme();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({
    personal: false, family: false, education: false, academic: true, settings: false,
  });
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Record<string, string>>({});

  const fetchProfile = useCallback(async () => {
    if (!user?.usn) return;
    try {
      const res = await API.get(`/student/profile/${user.usn}`);
      const data = res.data?.data ?? res.data;
      setProfile(data);
    } catch {
      setProfile(null);
    } finally {
      setLoading(false);
    }
  }, [user?.usn]);

  useEffect(() => { void fetchProfile(); }, [fetchProfile]);

  const toggleSection = (key: SectionKey) => {
    setExpandedSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const startEdit = (field: string, value: string | null) => {
    setEditingField(field);
    setEditValues({ [field]: value ?? '' });
  };

  const saveField = async (field: string) => {
    const value = editValues[field];
    try {
      await API.put('/student/profile', { [field]: value });
      setProfile((prev) => prev ? { ...prev, [field]: value } : prev);
      setEditingField(null);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message ?? 'Save failed');
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center" style={{ backgroundColor: colors.bg }}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!profile) {
    return (
      <View className="flex-1 justify-center items-center p-4" style={{ backgroundColor: colors.bg }}>
        <Text style={{ color: colors.text }}>Profile not available</Text>
        <Text className="text-sm mt-2" style={{ color: colors.textMuted }}>Could not load profile data</Text>
      </View>
    );
  }

  const isDetained = profile.detention?.isDetained && !profile.detention?.exempted;

  const Field = ({ label, value, field }: { label: string; value: string | null; field?: string }) => (
    <View className="mb-2">
      <Text className="text-[10px] uppercase tracking-wider" style={{ color: colors.textMuted }}>{label}</Text>
      {editingField === field ? (
        <View className="flex-row items-center gap-2">
          <TextInput
            className="flex-1 rounded-lg px-3 py-1.5 border text-sm"
            style={{ backgroundColor: colors.bgTertiary, color: colors.text, borderColor: colors.border }}
            value={editValues[field!] ?? ''}
            onChangeText={(v) => setEditValues((prev) => ({ ...prev, [field!]: v }))}
          />
          <TouchableOpacity onPress={() => saveField(field!)}>
            <Text className="text-sm text-blue-400">Save</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setEditingField(null)}>
            <Text className="text-sm text-red-400">Cancel</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View className="flex-row justify-between items-center">
          <Text className="text-sm" style={{ color: colors.text }}>{value ?? '-'}</Text>
          {field && (
            <TouchableOpacity onPress={() => startEdit(field, value)}>
              <Text className="text-xs text-blue-400">Edit</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const Section = ({ title, children, sectionKey }: { title: string; children: React.ReactNode; sectionKey?: SectionKey }) => (
    <Card className="mb-3" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
      <TouchableOpacity
        onPress={() => sectionKey && toggleSection(sectionKey)}
        className="flex-row justify-between items-center p-3"
      >
        <Text className="font-bold text-base" style={{ color: colors.text }}>{title}</Text>
        {sectionKey && (
          <Text className="text-lg" style={{ color: colors.textMuted }}>
            {expandedSections[sectionKey] ? '▼' : '▶'}
          </Text>
        )}
      </TouchableOpacity>
      {(!sectionKey || expandedSections[sectionKey]) && (
        <View className="px-3 pb-3">{children}</View>
      )}
    </Card>
  );

  return (
    <ScrollView className="flex-1" style={{ backgroundColor: colors.bg }}>
      <View className="p-4">
        {/* Header with Notification Bell */}
        <View className="flex-row justify-between items-center mb-4">
          <View>
            <Text className="text-xs uppercase tracking-widest" style={{ color: colors.textMuted }}>Profile</Text>
            <Text className="text-2xl font-bold mt-1" style={{ color: colors.text }}>{profile.name}</Text>
          </View>
          <NotificationBell />
        </View>

        {/* Detention Banner */}
        {isDetained && (
          <Card className="mb-3" style={{ backgroundColor: '#450a0a', borderColor: '#dc2626', borderWidth: 2 }}>
            <Text className="text-sm font-bold text-red-300">⚠ DETENTION NOTICE</Text>
            <Text className="text-xs mt-1 text-red-200">
              You are currently detained from SEE. Contact your HOD immediately.
            </Text>
            {profile.detention?.reasons?.map((r, i) => (
              <Text key={i} className="text-xs mt-0.5 text-red-300">• {r}</Text>
            ))}
          </Card>
        )}
        {profile.detention?.exempted && (
          <Card className="mb-3" style={{ backgroundColor: '#451a03', borderColor: '#d97706', borderWidth: 1 }}>
            <Text className="text-sm font-bold text-amber-300">Exemption granted. You may appear for SEE.</Text>
            <Text className="text-xs mt-1 text-amber-200">Conditions apply — check with HOD.</Text>
          </Card>
        )}

        {/* SECTION 1 — Academic Identity */}
        <Section title="Academic Identity" sectionKey="academic">
          <Field label="USN" value={profile.usn} />
          <Field label="Name" value={profile.name} />
          <Field label="Department" value={profile.department?.name ?? '-'} />
          <Field label="Section" value={profile.section} />
          <Field label="Semester" value={profile.semester} />
          <Field label="Batch" value={profile.batch} />
          <Field label="Admission Type" value={profile.admissionType} />
        </Section>

        {/* SECTION 2 — Personal Information */}
        <Section title="Personal Information" sectionKey="personal">
          <Field label="Date of Birth" value={profile.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString() : '-'} />
          <Field label="Phone" value={profile.studentPhone} field="studentPhone" />
          <Field label="Current Address" value={profile.currentAddress} field="currentAddress" />
          <Field label="Blood Group" value={profile.bloodGroup} field="bloodGroup" />
          <Field label="Nationality" value={profile.nationality} />
          <Field label="Religion" value={profile.religion} />
          <Field label="Category" value={profile.category} />
        </Section>

        {/* SECTION 3 — Family Information */}
        <Section title="Family Information" sectionKey="family">
          <Field label="Father Name" value={profile.fatherName} />
          <Field label="Father Occupation" value={profile.fatherOccupation} />
          <Field label="Father Phone" value={profile.fatherPhone} />
          <Field label="Mother Name" value={profile.motherName} />
          <Field label="Mother Occupation" value={profile.motherOccupation} />
          <Field label="Mother Phone" value={profile.motherPhone} />
        </Section>

        {/* SECTION 4 — Previous Education */}
        <Section title="Previous Education" sectionKey="education">
          {profile.isLateralEntry && (
            <View className="mb-2 rounded-lg p-2" style={{ backgroundColor: '#1e3a5f' }}>
              <Text className="text-xs text-blue-200">Lateral Entry — Diploma: {profile.diplomaMarks ?? '-'}%</Text>
            </View>
          )}
          <Text className="text-xs font-bold mt-2 mb-1" style={{ color: colors.textSecondary }}>10th Standard</Text>
          <Field label="Marks" value={profile.tenthMarks != null ? `${profile.tenthMarks}%` : '-'} />
          <Field label="Board" value={profile.tenthBoard} />
          <Field label="Pass Year" value={profile.tenthPassYear != null ? String(profile.tenthPassYear) : '-'} />

          <Text className="text-xs font-bold mt-2 mb-1" style={{ color: colors.textSecondary }}>PUC / 12th</Text>
          <Field label="Marks" value={profile.pucMarks != null ? `${profile.pucMarks}%` : '-'} />
          <Field label="Board" value={profile.pucBoard} />
          <Field label="Pass Year" value={profile.pucPassYear != null ? String(profile.pucPassYear) : '-'} />

          {(profile.cetRank || profile.cetScore) && (
            <>
              <Text className="text-xs font-bold mt-2 mb-1" style={{ color: colors.textSecondary }}>CET</Text>
              <Field label="Rank" value={profile.cetRank != null ? String(profile.cetRank) : '-'} />
              <Field label="Score" value={profile.cetScore != null ? String(profile.cetScore) : '-'} />
            </>
          )}
        </Section>

        {/* SECTION 5 — Academic Performance */}
        <Section title="Academic Performance">
          {profile.attendance.map((a) => (
            <View key={a.subjectCode} className="flex-row justify-between items-center mb-1">
              <Text className="text-xs" style={{ color: colors.text }}>{a.subjectCode}</Text>
              <Text className="text-xs" style={{ color: a.percent < 75 ? '#ef4444' : '#10b981' }}>
                {a.present}/{a.total} ({a.percent}%)
              </Text>
            </View>
          ))}
          {profile.cieSummaries.map((c) => (
            <View key={c.subjectCode} className="flex-row justify-between items-center mb-1">
              <Text className="text-xs" style={{ color: colors.text }}>{c.subjectCode}</Text>
              <Text className="text-xs" style={{ color: c.isEligible ? '#10b981' : '#ef4444' }}>
                {c.isEligible ? `✓ ${c.cieTotal}/50` : `✗ ${c.cieTotal}/50`}
              </Text>
            </View>
          ))}
        </Section>

        {/* SECTION 6 — Account Settings */}
        <Section title="Account Settings" sectionKey="settings">
          <Field label="Email" value={profile.email} />
          <TouchableOpacity className="mb-2 py-2">
            <Text className="text-sm text-blue-400">Change Password</Text>
          </TouchableOpacity>
          <TouchableOpacity className="mb-2 py-2">
            <Text className="text-sm text-blue-400">Link VCET Email</Text>
          </TouchableOpacity>
        </Section>

        <TouchableOpacity
          onPress={logout}
          className="bg-red-600 rounded-xl py-4 items-center mt-2 mb-8"
        >
          <Text className="text-white font-bold text-lg">Logout</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}
