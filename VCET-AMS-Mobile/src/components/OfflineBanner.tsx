import React from 'react';
import { Text, View } from 'react-native';
import { useNetInfo } from '@react-native-community/netinfo';

const OfflineBanner = () => {
  const netInfo = useNetInfo();

  if (netInfo.isConnected !== false) {
    return null;
  }

  return (
    <View
      pointerEvents="none"
      className="absolute top-0 left-0 right-0 z-50 bg-amber-500 px-4 py-2"
    >
      <Text className="text-center text-white font-semibold text-sm">
        Offline — showing cached data
      </Text>
    </View>
  );
};

export default OfflineBanner;
