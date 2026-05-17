import React from 'react';
import { TextInput } from 'react-native';

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
  return (
    <TextInput
      className={`w-full bg-slate-700 border border-slate-600 rounded-md h-12 px-4 my-2 text-white placeholder-slate-400 ${className}`}
      placeholder={placeholder}
      value={value}
      onChangeText={onChangeText}
      secureTextEntry={secureTextEntry}
      autoCapitalize={autoCapitalize}
      placeholderTextColor="#94a3b8"
    />
  );
};

export default Input;
