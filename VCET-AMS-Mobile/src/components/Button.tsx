import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface ButtonProps {
  onPress: () => void;
  title: string;
  className?: string;
  textClassName?: string;
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  style?: ViewStyle;
}

const variantStyles: Record<string, string> = {
  primary: 'bg-blue-600 active:bg-blue-700',
  secondary: 'bg-slate-200 dark:bg-slate-700 active:bg-slate-300 dark:active:bg-slate-600',
  danger: 'bg-red-600 active:bg-red-700',
  success: 'bg-green-600 active:bg-green-700',
};

const textVariantStyles: Record<string, string> = {
  primary: 'text-white',
  secondary: 'text-slate-800 dark:text-slate-200',
  danger: 'text-white',
  success: 'text-white',
};

const Button: React.FC<ButtonProps> = ({
  onPress,
  title,
  className = '',
  textClassName = '',
  disabled = false,
  variant = 'primary',
  style,
}) => {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={style}
      className={`py-3 px-6 rounded-lg items-center justify-center ${variantStyles[variant]} ${className} ${disabled ? 'opacity-50' : ''}`}
    >
      <Text className={`font-bold text-lg ${textVariantStyles[variant]} ${textClassName}`}>
        {title}
      </Text>
    </TouchableOpacity>
  );
};

export default Button;
