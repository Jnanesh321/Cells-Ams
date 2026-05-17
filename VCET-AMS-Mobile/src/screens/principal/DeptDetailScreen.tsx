import React from 'react';
import { View, Text } from 'react-native';
import { useRoute } from '@react-navigation/native';
import Card from '../../components/Card';
import BackHeader from '../../components/BackHeader';

const DeptDetailScreen = () => {
  const route = useRoute<any>();
  const { deptId } = route.params || {};

  return (
    <View className="flex-1 bg-slate-950">
      <BackHeader title={`${deptId ?? ''} Department`} />
      <View className="p-4">
        <Card className="bg-slate-900 border-slate-800 p-4">
          <Text className="text-white text-lg font-bold mb-2">{deptId} Department</Text>
          <Text className="text-slate-400 text-sm leading-5">
            Detailed analytics view for {deptId} department. This section will display subject-wise performance,
            faculty overview, and student attendance trends for the selected department.
          </Text>
        </Card>
      </View>
    </View>
  );
};

export default DeptDetailScreen;