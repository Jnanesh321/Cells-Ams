import React from 'react';
import { TextInput } from 'react-native';
import { useAppTheme } from '../hooks/useAppTheme';

interface InputProps {
  placeholder: string;
  value: string;
  onChangeText: (text: string) => void;
  secureTextEntry?: boolean;
  className?: string;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
}

const Input: React.FC<InputProps> = ({
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  className = '',
  autoCapitalize = 'none',
}) => {
  const { colors } = useAppTheme();

  return (
    <TextInput
      className={`w-full border rounded-md h-12 px-4 my-2 ${className}`}
      style={{
        backgroundColor: colors.bgInput,
        borderColor: colors.border,
        color: colors.text,
      }}
      placeholder={placeholder}
      placeholderTextColor={colors.placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
    />
  );
};

export default Input;
