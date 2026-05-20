import React from 'react';
import { ActivityIndicator, View } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface LoaderProps {
  size?: 'small' | 'large';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'large', className = '' }) => {
  const { colors } = useAppTheme();

  return (
    <View className={`flex-1 justify-center items-center ${className}`} style={{ backgroundColor: colors.bg }}>
      <ActivityIndicator size={size} color={colors.accentStudent} />
    </View>
  );
};

export default Loader;
