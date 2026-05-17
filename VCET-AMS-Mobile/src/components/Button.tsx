import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
}

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  className = '',
  textClassName = '',
  disabled = false,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`bg-blue-600 py-3 px-6 rounded-lg items-center justify-center active:bg-blue-700 ${className} ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`text-white font-bold text-lg ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
