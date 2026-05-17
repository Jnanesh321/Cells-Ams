import React from 'react';
import { ActivityIndicator, View } from 'react-native';

interface LoaderProps {
  size?: 'small' | 'large';
  className?: string;
}

const Loader: React.FC<LoaderProps> = ({ size = 'large', className = '' }) => {
  return (
    <View className={`flex-1 justify-center items-center ${className}`}>
      <ActivityIndicator size={size} color="#0000ff" />
    </View>
  );
};

export default Loader;
