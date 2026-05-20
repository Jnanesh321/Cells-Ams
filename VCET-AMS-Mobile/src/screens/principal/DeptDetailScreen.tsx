import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import { useAppTheme } from '../../hooks/useAppTheme';
import Card from '../../components/Card';
import BackHeader from '../../components/BackHeader';

const DeptDetailScreen = () => {
  const route = useRoute<any>();
  const { colors } = useAppTheme();
  const { deptId } = route.params || {};

  return (
    <View className="flex-1" style={{ backgroundColor: colors.bg }}>
      <BackHeader title={`${deptId ?? ''} Department`} />
      <View className="p-4">
        <Card className="p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, borderWidth: 1 }}>
          <Text className="text-lg font-bold mb-2" style={{ color: colors.text }}>{deptId} Department</Text>
          <Text className="text-sm leading-5" style={{ color: colors.textMuted }}>
            Detailed analytics view for {deptId} department. This section will display subject-wise performance,
            faculty overview, and student attendance trends for the selected department.
          </Text>
        </Card>
      </View>
    </View>
  );
};

export default DeptDetailScreen;